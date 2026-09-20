import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type {
  AppointmentRepo,
  DoctorRepo,
  UpdateUserInput,
  UserRepo,
} from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import type { Request, Response } from "express";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import {
  COOKIE_NAMES,
  clearSessionCookie,
  setSessionCookie,
} from "@/auth/cookies";
import { createMeetEvent, tryDeleteMeetEvent } from "@/config/google";
import { razorpay } from "@/config/razorpay";
import { env } from "@/env";
import {
  EntityNotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/errors";
import {
  appointmentIdSchema,
  bookAppointmentSchema,
  loginSchema,
  razorpayVerificationSchema,
  registerSchema,
  updateProfileSchema,
} from "./user.schemas";

export function createUserController(input: {
  users: UserRepo;
  hasher: PasswordHasher;
  auth: AuthProvider;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  image: ImageStore;
}) {
  const {
    users,
    hasher,
    auth,
    doctors,
    appointments,
    image: imageStore,
  } = input;

  async function register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await users.findByEmail(email);
    if (existing) {
      throw new ValidationError("Email already in use");
    }

    const passwordHash = await hasher.hash(password);
    const user = await users.create({ name, email, passwordHash });

    const session = await auth.createSession({ userId: user.id, role: "user" });
    setSessionCookie(
      res,
      COOKIE_NAMES.user,
      session.token,
      Date.parse(session.expiresAt) - Date.now(),
    );

    res.status(201).json({ success: true });
  }

  async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const { email, password } = parsed.data;

    const stored = await users.findByEmail(email);
    if (!stored) {
      // Same response as a wrong password so login can't reveal which
      // emails are registered.
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await hasher.verify(password, stored.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const session = await auth.createSession({
      userId: stored.id,
      role: "user",
    });
    setSessionCookie(
      res,
      COOKIE_NAMES.user,
      session.token,
      Date.parse(session.expiresAt) - Date.now(),
    );

    const { passwordHash: _passwordHash, ...safeUser } = stored;
    res.json({ success: true, user: safeUser });
  }

  async function logout(req: Request, res: Response) {
    const token: unknown = req.cookies?.[COOKIE_NAMES.user];
    if (typeof token === "string") {
      await auth.revokeSession(token);
    }
    clearSessionCookie(res, COOKIE_NAMES.user);
    res.json({ success: true, message: "Logged out" });
  }

  async function me(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }
    const user = await users.findById(req.user.id);
    if (!user) {
      throw new EntityNotFoundError("User not found");
    }
    res.json({ success: true, user });
  }

  async function getProfile(req: Request, res: Response) {
    await me(req, res);
  }

  async function updateProfile(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const { name, phone, address: addressJson, gender, dob } = parsed.data;

    let address: { line1: string; line2?: string } | undefined;
    if (addressJson) {
      try {
        const value: unknown = JSON.parse(addressJson);
        if (typeof value === "object" && value !== null) {
          address = value as { line1: string; line2?: string };
        }
      } catch {
        throw new ValidationError("Invalid address format");
      }
    }

    const payload: UpdateUserInput = {
      name,
      ...(address ? { address } : {}),
      ...(gender ? { gender } : {}),
      ...(phone ? { phone } : {}),
      ...(dob ? { dob } : {}),
    };

    if (req.file) {
      payload.image = await imageStore.upload(req.file.path);
    }

    const user = await users.update(req.user.id, payload);
    if (!user) throw new EntityNotFoundError("User not found");

    res.json({ success: true, user });
  }

  async function listAppointments(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const list = await appointments.findByUserId(req.user.id);
    res.json({ success: true, appointments: list });
  }

  async function bookAppointment(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");

    const parsed = bookAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }
    const { docId, slotDate, slotTime } = parsed.data;

    const [doctor, user] = await Promise.all([
      doctors.findById(docId),
      users.findById(req.user.id),
    ]);
    if (!doctor) throw new EntityNotFoundError("Doctor not found");
    if (!user) throw new EntityNotFoundError("User not found");
    if (!doctor.available) throw new ValidationError("Doctor not available");

    // Atomic slot reservation — rejects double-booking races.
    const booked = await doctors.bookSlot(docId, slotDate, slotTime);
    if (!booked) throw new ValidationError("Slot not available");

    let appointment: Awaited<ReturnType<typeof appointments.create>>;
    try {
      appointment = await appointments.create({
        userId: req.user.id,
        docId,
        slotDate,
        slotTime,
        userData: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image,
          dob: user.dob,
        },
        docData: {
          name: doctor.name,
          email: doctor.email,
          speciality: doctor.speciality,
          image: doctor.image,
        },
        amount: doctor.fees,
      });
    } catch (error) {
      // Compensate: release the slot so a failed booking doesn't leak it.
      try {
        await doctors.freeSlot(docId, slotDate, slotTime);
      } catch (freeError) {
        console.error("Failed to release reserved slot:", freeError);
      }
      throw error;
    }

    // Best-effort: create the Meet event on the doctor's calendar. A failure
    // never blocks the booking — the appointment stands without a link.
    let saved = appointment;
    try {
      const googleAuth = await doctors.getGoogleAuth(docId);
      if (googleAuth?.googleTokens?.access_token) {
        const { meetLink, googleEventId } = await createMeetEvent({
          tokens: googleAuth.googleTokens,
          appointmentId: appointment.id,
          doctorName: doctor.name,
          slotDate,
          slotTime,
        });
        saved =
          (await appointments.update(appointment.id, {
            meetLink,
            googleEventId,
          })) ?? saved;
      }
    } catch (error) {
      console.error("Google Meet creation failed:", error);
    }

    res.status(201).json({ success: true, appointment: saved });
  }

  async function cancelAppointment(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");

    const parsed = appointmentIdSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const appointment = await appointments.findById(parsed.data.appointmentId);
    if (!appointment) throw new EntityNotFoundError("Appointment not found");
    if (appointment.userId !== req.user.id) {
      throw new ForbiddenError("Not authorized");
    }
    if (appointment.cancelled) {
      throw new ValidationError("Appointment already cancelled");
    }

    // Best-effort: delete the doctor's calendar event (the doctor owns the meeting).
    const googleAuth = await doctors.getGoogleAuth(appointment.docId);
    await tryDeleteMeetEvent({
      tokens: googleAuth?.googleTokens,
      googleEventId: appointment.googleEventId,
    });

    const updated = await appointments.update(appointment.id, {
      cancelled: true,
    });
    if (!updated) throw new EntityNotFoundError("Appointment not found");
    await doctors.freeSlot(
      appointment.docId,
      appointment.slotDate,
      appointment.slotTime,
    );

    res.json({ success: true, appointment: updated });
  }

  async function createRazorpayOrder(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    if (!razorpay) throw new ValidationError("Payments not configured");

    const parsed = appointmentIdSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const appointment = await appointments.findById(parsed.data.appointmentId);
    if (!appointment) throw new EntityNotFoundError("Appointment not found");
    if (appointment.userId !== req.user.id) {
      throw new ForbiddenError("Not authorized");
    }
    if (appointment.cancelled) {
      throw new ValidationError("Appointment is cancelled");
    }
    if (appointment.payment) {
      throw new ValidationError("Appointment already paid");
    }

    const order = await razorpay.orders.create({
      amount: Math.round(appointment.amount * 100),
      currency: "INR",
      receipt: appointment.id,
    });

    res.json({ success: true, order });
  }

  async function verifyRazorpayPayment(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    if (!razorpay) throw new ValidationError("Payments not configured");

    const parsed = razorpayVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    if (!env.RAZORPAY_KEY_SECRET) {
      throw new ValidationError("Payments not configured");
    }

    const signatureValid = validatePaymentVerification(
      {
        order_id: parsed.data.razorpay_order_id,
        payment_id: parsed.data.razorpay_payment_id,
      },
      parsed.data.razorpay_signature,
      env.RAZORPAY_KEY_SECRET,
    );
    if (!signatureValid) throw new ValidationError("Invalid payment signature");

    const orderInfo = await razorpay.orders.fetch(
      parsed.data.razorpay_order_id,
    );
    if (orderInfo.status !== "paid") {
      throw new ValidationError("Payment failed");
    }

    const appointment = await appointments.findById(orderInfo.receipt ?? "");
    if (!appointment) throw new EntityNotFoundError("Appointment not found");
    if (appointment.userId !== req.user.id) {
      throw new ForbiddenError("Not authorized");
    }

    const updated = await appointments.update(appointment.id, {
      payment: true,
    });
    if (!updated) throw new EntityNotFoundError("Appointment not found");
    res.json({ success: true, appointment: updated });
  }

  return {
    register,
    login,
    logout,
    me,
    getProfile,
    updateProfile,
    listAppointments,
    bookAppointment,
    cancelAppointment,
    createRazorpayOrder,
    verifyRazorpayPayment,
  };
}
