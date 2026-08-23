import { DuplicateEmailError } from "@healthbridge/db";
import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { env } from "@/env";
import { CustomError } from "@/errors";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
    return JSON.stringify(error);
  }
  return "An unknown error occurred";
}

export default function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (env.NODE_ENV === "debug") console.error(error);

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      success: false,
      error: { message: error.message, code: error.code },
    });
    return;
  }

  if (error instanceof MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image too large — the maximum size is 5 MB"
        : `Upload failed: ${error.field ?? "file"}`;
    res.status(400).json({
      success: false,
      error: { message, code: error.code },
    });
    return;
  }

  if (error instanceof DuplicateEmailError) {
    res.status(409).json({
      success: false,
      error: { message: error.message, code: "EMAIL_IN_USE" },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: getErrorMessage(error),
      ...(env.NODE_ENV === "debug" && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
  });
}
