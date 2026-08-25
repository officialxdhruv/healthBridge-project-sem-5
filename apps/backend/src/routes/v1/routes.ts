import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import { Router } from "express";
import { createAdminRouter } from "./admin.route";
import { createDoctorRouter } from "./doctor.route";
import { createUserRouter } from "./user.route";

export function createV1Router(input: {
  users: UserRepo;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  hasher: PasswordHasher;
  auth: AuthProvider;
  image: ImageStore;
}) {
  const v1 = Router();

  v1.use("/user", createUserRouter(input));
  v1.use("/doctor", createDoctorRouter(input));
  v1.use("/admin", createAdminRouter(input));

  return v1;
}
