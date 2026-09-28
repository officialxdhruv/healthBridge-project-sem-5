import type { Appointment, Doctor, User } from "@healthbridge/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiPost } from "./api";

type MeResponse = { success: true; user: User };
type AuthResponse = { success: true; user?: User };

const ME_QUERY_KEY = ["me"] as const;

export function meQueryOptions() {
  return {
    queryKey: ME_QUERY_KEY,
    queryFn: () => apiGet<MeResponse>("/api/v1/user/me"),
    retry: false,
    // 401 means not logged in — don't treat as error for the UI
    throwOnError: false,
  };
}

export function doctorsQueryOptions() {
  return {
    queryKey: ["doctors"] as const,
    queryFn: async () => {
      const res = await apiGet<{ success: true; doctors: Doctor[] }>(
        "/api/v1/doctor/list",
      );
      return res.doctors;
    },
  };
}

export function profileQueryOptions() {
  return {
    queryKey: ["profile"] as const,
    queryFn: async () => {
      const res = await apiGet<{ user: User }>("/api/v1/user/get-profile");
      return res.user;
    },
  };
}

export function myAppointmentsQueryOptions() {
  return {
    queryKey: ["my-appointments"] as const,
    queryFn: async () => {
      const res = await apiGet<{ appointments: Appointment[] }>(
        "/api/v1/user/appointments",
      );
      return [...res.appointments].reverse();
    },
  };
}

export function useMeQuery() {
  return useQuery(meQueryOptions());
}

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiPost<AuthResponse>("/api/v1/user/login", input),
    onSuccess: (data) => {
      if (data.user) {
        qc.setQueryData(ME_QUERY_KEY, { success: true, user: data.user });
      } else {
        qc.invalidateQueries({ queryKey: ME_QUERY_KEY });
      }
    },
  });
}

export function useRegisterMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      apiPost<{ success: true }>("/api/v1/user/register", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ success: true }>("/api/v1/user/logout", {}),
    onSuccess: () => {
      qc.setQueryData(ME_QUERY_KEY, null);
    },
    onError: () => {
      // Clear locally even if server call fails
      qc.setQueryData(ME_QUERY_KEY, null);
    },
  });
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
