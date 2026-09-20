import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const addDoctorSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
  speciality: z.string().trim().min(1),
  degree: z.string().trim().min(1),
  experience: z.string().trim().min(1),
  about: z.string().trim().min(1),
  fees: z.coerce.number().min(0),
  address1: z.string().trim().min(1),
  address2: z.string().trim().optional().default(""),
});

export const appointmentIdSchema = z.object({
  appointmentId: z.string().min(1),
});

export const doctorIdSchema = z.object({
  docId: z.string().min(1),
});
