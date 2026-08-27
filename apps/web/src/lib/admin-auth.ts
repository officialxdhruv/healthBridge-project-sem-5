import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiPost } from "./api";

type AdminProfileResponse = {
  success: true;
  admin: { id: string; role: "admin" };
};

const ADMIN_QUERY_KEY = ["admin"] as const;

export function useAdminProfileQuery() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEY,
    queryFn: () => apiGet<AdminProfileResponse>("/api/v1/admin/profile"),
    retry: false,
    throwOnError: false,
  });
}

export function useAdminLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiPost<{ success: true }>("/api/v1/admin/login", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_QUERY_KEY });
    },
  });
}

export function useAdminLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ success: true }>("/api/v1/admin/logout", {}),
    onSuccess: () => {
      qc.setQueryData(ADMIN_QUERY_KEY, null);
    },
    onError: () => {
      qc.setQueryData(ADMIN_QUERY_KEY, null);
    },
  });
}

export function getAdminErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
