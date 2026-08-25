import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import { Router } from "express";
import { requireDoctor } from "@/middlewares/auth";
import { createDoctorController } from "./doctor.controller";

function createDoctorRouter(input: {
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  auth: AuthProvider;
  hasher: PasswordHasher;
  image: ImageStore;
}) {
  const router = Router();
  const { login, logout, getProfile } = createDoctorController(input);

  router.post("/login", login);
  router.post("/logout", logout);

  const authDoctor = requireDoctor(input.auth);
  router.get("/profile", authDoctor, getProfile);

  return router;
}

export { createDoctorRouter };
