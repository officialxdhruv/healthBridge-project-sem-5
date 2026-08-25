import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { fileTypeFromFile } from "file-type";
import multer from "multer";
import { ValidationError } from "@/errors";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Extension written for each sniffed MIME type — never trust the client's. */
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, "uploads");
  },
  filename: (_req, _file, callback) => {
    // Extension is appended only after the contents have been verified.
    callback(null, randomUUID());
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new ValidationError("Only JPEG, PNG, or WebP images are allowed"));
  },
});

/**
 * Sniffs the stored file's actual bytes and rejects anything that is not a
 * supported image (blocks HTML/SVG/script payloads disguised as images).
 * On success the file is renamed so its extension matches its real type.
 */
async function verifyImageContent(req: Request): Promise<void> {
  const file = req.file;
  if (!file) return;

  let detected: Awaited<ReturnType<typeof fileTypeFromFile>> | undefined;
  try {
    detected = await fileTypeFromFile(file.path);
  } catch {
    detected = undefined;
  }

  const extension = detected ? EXTENSION_BY_MIME[detected.mime] : undefined;
  if (!extension) {
    await fs.unlink(file.path).catch(() => {});
    throw new ValidationError("Uploaded file is not a supported image");
  }

  const filename = `${file.filename}${extension}`;
  await fs.rename(file.path, path.join(path.dirname(file.path), filename));
  file.filename = filename;
  file.path = path.join(path.dirname(file.path), filename);
}

/** Handles a single "image" upload field from multipart form data. */
export function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  upload.single("image")(req, res, (error) => {
    if (error) {
      next(error);
      return;
    }
    verifyImageContent(req)
      .then(() => next())
      .catch(next);
  });
}
