import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import type { Request, Response } from "express";
import {
  COOKIE_NAMES,
  clearSessionCookie,
  setSessionCookie,
} from "@/auth/cookies";
import {
  EntityNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/errors";
import { loginSchema } from "./doctor.schemas";

export function createDoctorController(input: {
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  auth: AuthProvider;
  hasher: PasswordHasher;
  image: ImageStore;
}) {
  const { doctors, auth, hasher } = input;

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

  return {
    login,
    logout,
    getProfile,
  };
}
