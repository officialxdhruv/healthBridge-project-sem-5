/** Uploads an image already written to disk by multer and returns its public URL. */
export interface ImageStore {
  upload(diskPath: string): Promise<string>;
}
