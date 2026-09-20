import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import { Router } from "express";
import { requireDoctor } from "@/middlewares/auth";
import { uploadImage } from "@/middlewares/upload";
import { createDoctorController } from "./doctor.controller";
import { createGoogleRouter } from "./doctor.google.route";

function createDoctorRouter(input: {
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  auth: AuthProvider;
  hasher: PasswordHasher;
  image: ImageStore;
}) {
  const router = Router();
  const {
    list,
    login,
    logout,
    getProfile,
    updateProfile,
    changeAvailability,
    listAppointments,
    completeAppointment,
    cancelAppointment,
    dashboard,
  } = createDoctorController(input);

  router.get("/list", list);
  router.post("/login", login);
  router.post("/logout", logout);

  const authDoctor = requireDoctor(input.auth);
  router.get("/profile", authDoctor, getProfile);
  router.get("/dashboard", authDoctor, dashboard);
  router.post("/update-profile", authDoctor, uploadImage, updateProfile);
  router.post("/change-availability", authDoctor, changeAvailability);
  router.get("/appointments", authDoctor, listAppointments);
  router.post("/complete-appointment", authDoctor, completeAppointment);
  router.post("/cancel-appointment", authDoctor, cancelAppointment);

  router.use(createGoogleRouter(input));

  return router;
}

export { createDoctorRouter };
