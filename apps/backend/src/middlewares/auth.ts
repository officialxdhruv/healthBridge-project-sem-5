import type { AuthProvider } from "@healthbridge/auth";
import type { AuthUser, Role } from "@healthbridge/types";
import type { NextFunction, Request, Response } from "express";
import { COOKIE_NAMES } from "@/auth/cookies";
import { UnauthorizedError } from "@/errors";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function requireRole(auth: AuthProvider, cookieName: string, role: Role) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[cookieName];

    if (typeof token !== "string" || token.length === 0) {
      next(new UnauthorizedError("Not authenticated"));
      return;
    }

    try {
      const sessionUser = await auth.verifySession(token);
      if (sessionUser.role !== role) {
        next(new UnauthorizedError("Not authenticated"));
        return;
      }
      req.user = sessionUser;
      next();
    } catch {
      next(new UnauthorizedError("Not authenticated"));
    }
  };
}

export function requireUser(auth: AuthProvider) {
  return requireRole(auth, COOKIE_NAMES.user, "user");
}

export function requireDoctor(auth: AuthProvider) {
  return requireRole(auth, COOKIE_NAMES.doctor, "doctor");
}

export function requireAdmin(auth: AuthProvider) {
  return requireRole(auth, COOKIE_NAMES.admin, "admin");
}
