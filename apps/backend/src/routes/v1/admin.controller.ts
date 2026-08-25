import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import type { Request, Response } from "express";
import {
  COOKIE_NAMES,
  clearSessionCookie,
  setSessionCookie,
} from "@/auth/cookies";
import { env } from "@/env";
import { UnauthorizedError, ValidationError } from "@/errors";
import { loginSchema } from "./admin.schemas";

export function createAdminController(input: {
  auth: AuthProvider;
  hasher: PasswordHasher;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  users: UserRepo;
  image: ImageStore;
}) {
  const { auth } = input;

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

  return {
    login,
    logout,
  };
}
