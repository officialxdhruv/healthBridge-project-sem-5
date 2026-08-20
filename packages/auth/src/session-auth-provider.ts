import { createHash, randomBytes } from "node:crypto";
import type { SessionRepo } from "@healthbridge/db";
import type { Role } from "@healthbridge/types";
import type { AuthProvider, IssuedSession, SessionUser } from "./auth-provider";
import { SessionExpiredError, SessionInvalidError } from "./errors";

export interface SessionAuthProviderConfig {
  /** Idle lifetime (ms). Each verified request renews expiry (sliding). */
  ttlMs: number;
  /** Entropy (bytes) for the raw session token. */
  tokenBytes?: number;
}

const DEFAULT_TOKEN_BYTES = 32;

export const SESSION_TOKEN_TTL_REFRESHED = "session-refreshed";
export const SESSION_TOKEN_EXPIRED = "session-expired";
export const SESSION_TOKEN_INVALID = "session-invalid";

/**
 * Option-B session auth: server-side sessions stored via the db SessionRepo.
 * - createSession: random raw token returned to caller; SHA-256 hash stored with role+userId.
 * - verifySession: finds by hash, enforces TTL; on success renews expiry (sliding).
 * - revokeSession: deletes the server-side row (instant logout/revocation).
 */
export class SessionAuthProvider implements AuthProvider {
  private readonly tokenBytes: number;

  constructor(
    private readonly sessionRepo: SessionRepo,
    private readonly config: SessionAuthProviderConfig,
  ) {
    this.tokenBytes = config.tokenBytes ?? DEFAULT_TOKEN_BYTES;
  }

  async createSession(input: {
    userId: string;
    role: Role;
  }): Promise<IssuedSession> {
    const token = newRawToken(this.tokenBytes);
    const expiresAt = new Date(Date.now() + this.config.ttlMs);

    await this.sessionRepo.create({
      tokenHash: hashToken(token),
      userId: input.userId,
      role: input.role,
      expiresAt,
    });

    return { token, expiresAt: expiresAt.toISOString() };
  }

  async verifySession(token: string): Promise<SessionUser> {
    const session = await this.sessionRepo.findByTokenHash(hashToken(token));

    if (!session) {
      throw new SessionInvalidError("No session found");
    }

    if (Date.now() > Date.parse(session.expiresAt)) {
      await this.sessionRepo.delete(session.id).catch(() => undefined);
      throw new SessionExpiredError("Session expired");
    }

    // Sliding renewal: extend expiry on activity
    const renewed = new Date(Date.now() + this.config.ttlMs);
    await this.sessionRepo.touch(session.id, renewed).catch(() => undefined);

    return { id: session.userId, role: session.role };
  }

  async revokeSession(token: string): Promise<void> {
    const session = await this.sessionRepo.findByTokenHash(hashToken(token));
    if (session) {
      await this.sessionRepo.delete(session.id);
    }
  }
}

function newRawToken(bytes: number): string {
  return randomBytes(bytes).toString("base64url");
}

/** Session records never store the raw token — only a stable hash. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
