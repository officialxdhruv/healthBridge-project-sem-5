import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import type { Request, Response } from "express";
import {
  COOKIE_NAMES,
  clearSessionCookie,
  setSessionCookie,
} from "@/auth/cookies";
import { tryDeleteMeetEvent } from "@/config/google";
import { env } from "@/env";
import {
  EntityNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/errors";
import {
  addDoctorSchema,
  appointmentIdSchema,
  doctorIdSchema,
  loginSchema,
} from "./admin.schemas";

export function createAdminController(input: {
  auth: AuthProvider;
  hasher: PasswordHasher;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  users: UserRepo;
  image: ImageStore;
}) {
  const {
    auth,
    hasher,
    doctors,
    appointments,
    users,
    image: imageStore,
  } = input;

  async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const { email, password } = parsed.data;
    if (email !== env.ADMIN_EMAIL || password !== env.ADMIN_PASSWORD) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const session = await auth.createSession({
      userId: "admin",
      role: "admin",
    });
    setSessionCookie(
      res,
      COOKIE_NAMES.admin,
      session.token,
      Date.parse(session.expiresAt) - Date.now(),
    );

    res.json({ success: true });
  }

  async function logout(req: Request, res: Response) {
    const token: unknown = req.cookies?.[COOKIE_NAMES.admin];
    if (typeof token === "string") {
      await auth.revokeSession(token);
    }
    clearSessionCookie(res, COOKIE_NAMES.admin);
    res.json({ success: true, message: "Logged out" });
  }

  async function addDoctor(req: Request, res: Response) {
    const parsed = addDoctorSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address1,
      address2,
    } = parsed.data;

    const existing = await doctors.findByEmail(email);
    if (existing) {
      throw new ValidationError("Email already in use");
    }

    const passwordHash = await hasher.hash(password);
    const doctor = await doctors.create({
      name,
      email,
      passwordHash,
      image: req.file ? await imageStore.upload(req.file.path) : "",
      speciality,
      degree,
      experience,
      about,
      fees,
      address: { line1: address1, line2: address2 },
    });

    res.status(201).json({ success: true, doctor });
  }

  async function allDoctors(_req: Request, res: Response) {
    const doctorList = await doctors.findAll();
    const safeDoctors = doctorList.map(({ email: _email, ...rest }) => rest);
    res.json({ success: true, doctors: safeDoctors });
  }

  async function listAppointments(_req: Request, res: Response) {
    const list = await appointments.findAll();
    list.sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    );
    res.json({ success: true, appointments: list });
  }

  async function cancelAppointment(req: Request, res: Response) {
    const parsed = appointmentIdSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const appointment = await appointments.findById(parsed.data.appointmentId);
    if (!appointment) throw new EntityNotFoundError("Appointment not found");
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

  async function changeAvailability(req: Request, res: Response) {
    const parsed = doctorIdSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Validation failed",
      );
    }

    const doctor = await doctors.findById(parsed.data.docId);
    if (!doctor) throw new EntityNotFoundError("Doctor not found");

    const updated = await doctors.setAvailability(doctor.id, !doctor.available);
    if (!updated) throw new EntityNotFoundError("Doctor not found");
    res.json({ success: true, doctor: updated });
  }

  async function dashboard(_req: Request, res: Response) {
    const [doctorCount, appointmentCount, patientCount] = await Promise.all([
      doctors.count(),
      appointments.count(),
      users.count(),
    ]);

    const all = await appointments.findAll();
    const latestAppointments = [...all]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      )
      .slice(0, 5);

    res.json({
      success: true,
      dashData: {
        doctors: doctorCount,
        appointments: appointmentCount,
        patients: patientCount,
        latestAppointments,
      },
    });
  }

  return {
    login,
    logout,
    addDoctor,
    allDoctors,
    listAppointments,
    cancelAppointment,
    changeAvailability,
    dashboard,
  };
}
