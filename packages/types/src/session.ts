import type { Role } from "./primitives";

export interface Session {
  id: string;
  tokenHash: string;
  userId: string;
  role: Role;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionUser {
  id: string;
  role: Role;
}

/** Authenticated principal resolved from a verified session. */
export interface AuthUser {
  id: string;
  role: Role;
}
