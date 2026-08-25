import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import { Router } from "express";
import { requireUser } from "@/middlewares/auth";
import { createUserController } from "./user.controller";

export function createUserRouter(input: {
  users: UserRepo;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  hasher: PasswordHasher;
  auth: AuthProvider;
  image: ImageStore;
}) {
  const router = Router();
  const { register, login, logout, me } = createUserController(input);

  router.post("/register", register);
  router.post("/login", login);
  router.post("/logout", logout);

  const auth = requireUser(input.auth);
  router.get("/me", auth, me);

  return router;
}
