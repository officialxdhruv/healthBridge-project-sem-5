import type { DoctorRepo } from "@healthbridge/db";
import type { Request, Response } from "express";
import {
  exchangeGoogleCode,
  generateGoogleAuthUrl,
  signGoogleState,
  verifyGoogleState,
} from "@/config/google";
import { env } from "@/env";
import { EntityNotFoundError, UnauthorizedError } from "@/errors";

export function createGoogleController(input: { doctors: DoctorRepo }) {
  const { doctors } = input;

  async function connect(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const state = signGoogleState(req.user.id);
    res.redirect(generateGoogleAuthUrl(state));
  }

  async function callback(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");

    const { code, state, error } = req.query;
    if (typeof error === "string") {
      res.redirect(`${env.FRONTEND_URL}/?google=error`);
      return;
    }
    if (typeof code !== "string" || code.length === 0) {
      res.redirect(`${env.FRONTEND_URL}/?google=error`);
      return;
    }
    if (typeof state !== "string" || !verifyGoogleState(state, req.user.id)) {
      res.redirect(`${env.FRONTEND_URL}/?google=error`);
      return;
    }

    const doctor = await doctors.findById(req.user.id);
    if (!doctor) throw new EntityNotFoundError("Doctor not found");

    const googleTokens = await exchangeGoogleCode(code);
    const saved = await doctors.saveGoogleAuth(req.user.id, googleTokens, true);
    if (!saved) {
      res.redirect(`${env.FRONTEND_URL}/?google=error`);
      return;
    }

    res.redirect(`${env.FRONTEND_URL}/?google=success`);
  }

  async function status(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const doctor = await doctors.findById(req.user.id);
    if (!doctor) throw new EntityNotFoundError("Doctor not found");
    res.json({ success: true, isGoogleLinked: doctor.isGoogleLinked ?? false });
  }

  return { connect, callback, status };
}
