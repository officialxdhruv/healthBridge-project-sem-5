import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import { Router } from "express";
import { requireAdmin } from "@/middlewares/auth";
import { uploadImage } from "@/middlewares/upload";
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
  const {
    login,
    logout,
    addDoctor,
    allDoctors,
    listAppointments,
    cancelAppointment,
    changeAvailability,
    dashboard,
  } = createAdminController(input);

  const authAdmin = requireAdmin(input.auth);
  router.post("/login", login);
  router.post("/logout", logout);
  router.post("/add-doctor", authAdmin, uploadImage, addDoctor);
  router.get("/all-doctors", authAdmin, allDoctors);
  router.get("/appointments", authAdmin, listAppointments);
  router.post("/cancel-appointment", authAdmin, cancelAppointment);
  router.post("/change-availability", authAdmin, changeAvailability);
  router.get("/dashboard", authAdmin, dashboard);

  return router;
}

export { createAdminRouter };
