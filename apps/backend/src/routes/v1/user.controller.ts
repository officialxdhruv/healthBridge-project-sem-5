import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
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
import { loginSchema, registerSchema } from "./user.schemas";

export function createUserController(input: {
  users: UserRepo;
  hasher: PasswordHasher;
  auth: AuthProvider;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  image: ImageStore;
}) {
  const { users, hasher, auth } = input;

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

  return {
    register,
    login,
    logout,
    me,
  };
}
