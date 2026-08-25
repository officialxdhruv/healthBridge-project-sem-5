import type { Response } from "express";
import { env } from "@/env";

export const COOKIE_NAMES = {
  user: "user-token",
  doctor: "doctor-token",
  admin: "admin-token",
} as const;

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setSessionCookie(
  res: Response,
  name: string,
  token: string,
  maxAgeMs: number,
): void {
  res.cookie(name, token, {
    ...baseCookieOptions,
    maxAge: maxAgeMs,
  });
}

export function clearSessionCookie(res: Response, name: string): void {
  res.clearCookie(name, { ...baseCookieOptions });
}
