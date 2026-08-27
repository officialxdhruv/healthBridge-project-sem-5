import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import { Router } from "express";
import { requireAdmin } from "@/middlewares/auth";
import { createAdminController } from "./admin.controller";

function createAdminRouter(input: {
  auth: AuthProvider;
  hasher: PasswordHasher;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  users: UserRepo;
  image: ImageStore;
}) {
  const router = Router();
  const { login, logout, getProfile } = createAdminController(input);

  router.post("/login", login);
  router.post("/logout", logout);

  router.get("/profile", requireAdmin(input.auth), getProfile);

  return router;
}

export { createAdminRouter };
