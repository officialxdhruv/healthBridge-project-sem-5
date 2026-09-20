import type { AuthProvider } from "@healthbridge/auth";
import type { DoctorRepo } from "@healthbridge/db";
import { Router } from "express";
import { requireDoctor } from "@/middlewares/auth";
import { createGoogleController } from "./doctor.google.controller";

function createGoogleRouter(input: {
  doctors: DoctorRepo;
  auth: AuthProvider;
}) {
  const router = Router();
  const { connect, callback, status } = createGoogleController(input);

  const authDoctor = requireDoctor(input.auth);
  router.get("/google", authDoctor, connect);
  router.get("/google/callback", authDoctor, callback);
  router.get("/google/status", authDoctor, status);

  return router;
}

export { createGoogleRouter };
