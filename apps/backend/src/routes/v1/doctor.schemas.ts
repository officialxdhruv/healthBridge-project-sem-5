import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export const updateDoctorSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  speciality: z.string().trim().min(1).optional(),
  degree: z.string().trim().min(1).optional(),
  experience: z.string().trim().min(1).optional(),
  about: z.string().trim().min(1).optional(),
  fees: z.coerce.number().min(0).optional(),
  address: z.string().trim().optional(),
});

export const appointmentIdSchema = z.object({
  appointmentId: z.string().min(1),
});
