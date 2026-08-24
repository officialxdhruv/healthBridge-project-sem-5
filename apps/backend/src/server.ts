import type { AuthProvider, PasswordHasher } from "@healthbridge/auth";
import type { AppointmentRepo, DoctorRepo, UserRepo } from "@healthbridge/db";
import type { ImageStore } from "@healthbridge/image";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "@/env";
import errorHandler from "@/middlewares/error-handler";

export function createServer(input: {
  users: UserRepo;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  hasher: PasswordHasher;
  auth: AuthProvider;
  image: ImageStore;
}) {
  const app = express();

  app
    .disable("x-powered-by")
    .use(express.json())
    .use(cookieParser())
    .use(express.urlencoded({ extended: true }))
    .use(
      cors({
        origin: [env.FRONTEND_URL],
        credentials: true,
      }),
    );

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, environment: env.NODE_ENV });
  });

  app.use(
    "/uploads",
    express.static("uploads", {
      setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Security-Policy", "default-src 'none'");
      },
    }),
  );

  app.use((_req, res) => {
    console.log(_req.method);
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use(errorHandler);

  return app;
}
