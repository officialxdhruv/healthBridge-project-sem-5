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

export const bookAppointmentSchema = z.object({
  docId: z.string().min(1),
  slotDate: z.string().min(1),
  slotTime: z.string().min(1),
});

export const appointmentIdSchema = z.object({
  appointmentId: z.string().min(1),
});

export const razorpayVerificationSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
