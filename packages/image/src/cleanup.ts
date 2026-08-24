import { unlink } from "node:fs/promises";

/**
 * Best-effort removal of the multer temp file. Never throws — a leftover file
 * must not fail the request, and the file may already be gone.
 */
export async function cleanupTempFile(diskPath: string): Promise<void> {
  try {
    await unlink(diskPath);
  } catch {
    // Ignore — the file may already be gone.
  }
}
