import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().min(1000).default(3000),
    MONGODB_URI: z.string().min(1),
    MONGODB_DB_NAME: z.string().min(1).default("healthbridge"),
    NODE_ENV: z
      .enum(["development", "production", "debug"])
      .default("development"),
    FRONTEND_URL: z.string().min(1),
    ADMIN_URL: z.string().min(1),
    ADMIN_EMAIL: z.email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    SESSION_TTL_MINUTES: z.coerce.number().min(1).default(30),
    RAZORPAY_KEY_ID: z.string().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GOOGLE_REDIRECT_URI: z.string().min(1).optional(),
    GOOGLE_STATE_SECRET: z.string().min(16).optional(),
    CALENDAR_TIMEZONE: z.string().min(1).default("Asia/Kolkata"),
    IMAGE_PROVIDER: z
      .enum(["local", "cloudinary", "imagekit"])
      .default("local"),
    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),
    IMAGEKIT_PRIVATE_KEY: z.string().min(1).optional(),
    IMAGEKIT_PUBLIC_KEY: z.string().min(1).optional(),
    IMAGEKIT_URL_ENDPOINT: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
