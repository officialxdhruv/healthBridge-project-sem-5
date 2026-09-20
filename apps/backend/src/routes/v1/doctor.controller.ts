import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type {
  AppointmentRepo,
  DoctorRepo,
  UpdateDoctorInput,
} from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import type { Request, Response } from "express";
import {
  COOKIE_NAMES,
  clearSessionCookie,
  setSessionCookie,
} from "@/auth/cookies";
import { tryDeleteMeetEvent } from "@/config/google";
import {
  EntityNotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/errors";
import {
  appointmentIdSchema,
  loginSchema,
  updateDoctorSchema,
} from "./doctor.schemas";

export function createDoctorController(input: {
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  auth: AuthProvider;
  hasher: PasswordHasher;
  image: ImageStore;
}) {
  const { doctors, appointments, auth, hasher, image } = input;

  async function list(_req: Request, res: Response) {
    const all = await doctors.findAll();

    // Public directory — strip email and passwordHash.
    const doctorsSafe = all.map(({ email: _email, ...rest }) => rest);

    res.json({ success: true, doctors: doctorsSafe });
  }

  async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const { email, password } = parsed.data;

    const stored = await doctors.findByEmail(email);
    if (!stored) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await hasher.verify(password, stored.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const session = await auth.createSession({
      userId: stored.id,
      role: "doctor",
    });
    setSessionCookie(
      res,
      COOKIE_NAMES.doctor,
      session.token,
      Date.parse(session.expiresAt) - Date.now(),
    );

    res.json({ success: true });
  }

  async function logout(req: Request, res: Response) {
    const token: unknown = req.cookies?.[COOKIE_NAMES.doctor];
    if (typeof token === "string") {
      await auth.revokeSession(token);
    }
    clearSessionCookie(res, COOKIE_NAMES.doctor);
    res.json({ success: true, message: "Logged out" });
  }

  async function getProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const doctor = await doctors.findById(req.user.id);
    if (!doctor) throw new EntityNotFoundError("Doctor not found");
    res.json({ success: true, doctor });
  }

  async function updateProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");

    const parsed = updateDoctorSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }
    const {
      name,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: addressJson,
    } = parsed.data;

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

    const payload: UpdateDoctorInput = {
      name,
      speciality,
      degree,
      experience,
      about,
      fees,
      ...(address ? { address } : {}),
    };

    if (req.file) {
      payload.image = await image.upload(req.file.path);
    }

    const doctor = await doctors.update(req.user.id, payload);
    if (!doctor) throw new EntityNotFoundError("Doctor not found");

    res.json({ success: true, doctor });
  }

  async function changeAvailability(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const current = await doctors.findById(req.user.id);
    if (!current) throw new EntityNotFoundError("Doctor not found");
    const doctor = await doctors.setAvailability(
      req.user.id,
      !current.available,
    );
    if (!doctor) throw new EntityNotFoundError("Doctor not found");
    res.json({ success: true, doctor });
  }

  async function listAppointments(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const list = await appointments.findByDoctorId(req.user.id);
    res.json({ success: true, appointments: list });
  }

  async function completeAppointment(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const parsed = appointmentIdSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const appointment = await appointments.findById(parsed.data.appointmentId);
    if (!appointment) throw new EntityNotFoundError("Appointment not found");
    if (appointment.docId !== req.user.id) {
      throw new ForbiddenError("Not authorized");
    }

    const updated = await appointments.update(appointment.id, {
      isCompleted: true,
    });
    if (!updated) throw new EntityNotFoundError("Appointment not found");
    res.json({ success: true, appointment: updated });
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
    if (appointment.docId !== req.user.id) {
      throw new ForbiddenError("Not authorized");
    }
    if (appointment.cancelled) {
      throw new ValidationError("Appointment already cancelled");
    }

    // Best-effort: delete the doctor's calendar event.
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

  async function dashboard(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const appts = await appointments.findByDoctorId(req.user.id);

    let earnings = 0;
    const patientSet = new Set<string>();

    appts.forEach((a) => {
      if (!a.cancelled && a.payment) earnings += a.amount;
      patientSet.add(a.userId);
    });

    const latestAppointments = [...appts]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      )
      .slice(0, 5);

    res.json({
      success: true,
      dashData: {
        earnings,
        appointments: appts.length,
        patients: patientSet.size,
        latestAppointments,
      },
    });
  }

  return {
    list,
    login,
    logout,
    getProfile,
    updateProfile,
    changeAvailability,
    listAppointments,
    completeAppointment,
    cancelAppointment,
    dashboard,
  };
}
