import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import { Router } from "express";
import { requireUser } from "@/middlewares/auth";
import { uploadImage } from "@/middlewares/upload";
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
  const {
    register,
    login,
    logout,
    me,
    getProfile,
    updateProfile,
    listAppointments,
  } = createUserController(input);

  router.post("/register", register);
  router.post("/login", login);
  router.post("/logout", logout);

  const auth = requireUser(input.auth);
  router.get("/me", auth, me);
  router.get("/get-profile", auth, getProfile);
  router.post("/update-profile", auth, uploadImage, updateProfile);
  router.get("/appointments", auth, listAppointments);

  return router;
}
