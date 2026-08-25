import { createReadStream } from "node:fs";
import { basename } from "node:path";
import ImageKit from "@imagekit/nodejs";
import { cleanupTempFile } from "../cleanup";
import type { ImageStore } from "../types";

/**
 * Uploads to ImageKit and returns the public URL, removing the temp disk file
 * in all cases (success or failure) so failed uploads don't litter /uploads.
 * The SDK retries transient connection errors (2x, exponential backoff) and
 * respects a per-request timeout, so no manual retry loop is needed here.
 */
export class ImageKitImageStore implements ImageStore {
  #client: ImageKit;
  #folder?: string;

  constructor(input: { privateKey: string; folder?: string }) {
    this.#client = new ImageKit({
      privateKey: input.privateKey,
      timeout: 30_000,
    });
    this.#folder = input.folder?.replace(/^\/+|\/+$/g, "") || undefined;
  }

  async upload(diskPath: string): Promise<string> {
    try {
      const fileName = basename(diskPath);
      const result = await this.#client.files.upload({
        file: createReadStream(diskPath),
        fileName,
        folder: this.#folder ?? undefined,
        useUniqueFileName: false,
      });
      // The API always returns a URL, but the SDK types it as optional.
      if (!result.url) {
        throw new Error("ImageKit upload succeeded but returned no URL");
      }
      return result.url;
    } finally {
      await cleanupTempFile(diskPath);
    }
  }
}
