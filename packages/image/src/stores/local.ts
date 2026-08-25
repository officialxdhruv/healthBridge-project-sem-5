import { basename } from "node:path";
import type { ImageStore } from "../types";

/** Keeps using the local `/uploads` directory; returns relative paths as-is. */
export class LocalImageStore implements ImageStore {
  async upload(diskPath: string): Promise<string> {
    return `/uploads/${basename(diskPath)}`;
  }
}
