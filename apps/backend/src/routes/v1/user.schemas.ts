import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().optional(),
  gender: z.enum(["Male", "Female", "Other", "Not Selected"]).optional(),
  dob: z.string().trim().optional(),
});
