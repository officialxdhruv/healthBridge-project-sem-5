import type { Role } from "@healthbridge/types";
import type { AuthError } from "./errors";

export interface IssuedSession {
  /** Raw session token a client receives (stored hashed on the server). */
  token: string;
  /** UTC expiry of the session. */
  expiresAt: string;
}

export interface SessionUser {
  id: string;
  role: Role;
}

/**
 * Swappable auth contract. The app codes against this interface only —
 * concrete providers (e.g. SessionAuthProvider) plug in underneath.
 */
export interface AuthProvider {
  /** Full session (hashed on the server) + raw token to hand to the client. */
  createSession(input: { userId: string; role: Role }): Promise<IssuedSession>;
  /** Verify a raw token; returns the authenticated principal or throws an AuthError. */
  verifySession(token: string): Promise<SessionUser>;
  /** Destroy a session server-side. */
  revokeSession(token: string): Promise<void>;
}

export function isAuthError(error: unknown): error is AuthError {
  return typeof error === "object" && error !== null && "code" in error;
}
