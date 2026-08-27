const API_URL = import.meta.env.BACKEND_URL ?? "http://localhost:3000";

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body as { error?: { message?: string; code?: string } } | null;
    throw new ApiError(
      err?.error?.message ?? `Request failed (${res.status})`,
      res.status,
      err?.error?.code,
    );
  }

  return body as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
