const BASE_URL = import.meta.env.BACKEND_URL ?? "http://localhost:3000";

export const backendBaseUrl = BASE_URL;

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: isForm
      ? init.headers
      : { "Content-Type": "application/json", ...init.headers },
  });

  const data = (await res.json().catch(() => null)) as {
    error?: { message?: string; code?: string };
  } | null;

  if (!res.ok) {
    throw new ApiError(
      data?.error?.message ?? `Request failed (${res.status})`,
      res.status,
      data?.error?.code,
    );
  }

  return data as T;
}

export const apiGet = <T>(path: string) => {
  return request<T>(path);
};

export const apiPost = <T>(path: string, body: unknown) => {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const apiPostForm = <T>(path: string, form: FormData) => {
  return request<T>(path, {
    method: "POST",
    body: form,
  });
};

export const api = {
  get: apiGet,
  post: apiPost,
  postForm: apiPostForm,
};
