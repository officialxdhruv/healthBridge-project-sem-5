export type ApiEnvelope<T = undefined> = T extends undefined
  ? { success: true }
  : { success: true; data: T };

export type ApiError = {
  success: false;
  error: { message: string; code: string };
};

export type ApiResponse<T = undefined> = ApiEnvelope<T> | ApiError;
