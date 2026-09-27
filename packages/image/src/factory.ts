import { ImageKitImageStore } from "./stores/imagekit";
import type { ImageStore } from "./types";

export type ImageStoreConfig = {
  provider: "imagekit";
  privateKey: string;
  folder?: string;
};

/**
 * Factory — ImageKit only. Consumers only ever see the `ImageStore` interface.
 */
export function createImageStore(config: ImageStoreConfig): ImageStore {
  switch (config.provider) {
    case "imagekit":
      return new ImageKitImageStore(config);
    default:
      throw new Error(`Unknown image provider: ${JSON.stringify(config)}`);
  }
}
