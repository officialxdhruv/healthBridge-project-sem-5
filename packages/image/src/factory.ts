import { ImageKitImageStore } from "./stores/imagekit";
import { LocalImageStore } from "./stores/local";
import type { ImageStore } from "./types";

export type ImageStoreConfig =
  | { provider: "local" }
  | {
      provider: "imagekit";
      privateKey: string;
      folder?: string;
    };

/**
 * Factory — swap the provider here; consumers only ever see the `ImageStore`
 * interface. Unknown providers throw instead of silently falling back to
 * local storage, so a misconfigured provider is loud, not hidden.
 */
export function createImageStore(config: ImageStoreConfig): ImageStore {
  switch (config.provider) {
    case "local":
      return new LocalImageStore();
    case "imagekit":
      return new ImageKitImageStore(config);
    default:
      throw new Error(`Unknown image provider: ${JSON.stringify(config)}`);
  }
}
