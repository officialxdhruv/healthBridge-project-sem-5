import type { Doctor } from "@healthbridge/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiPost } from "./api";

type DoctorProfileResponse = { success: true; doctor: Doctor };

const DOCTOR_QUERY_KEY = ["doctor"] as const;

export function useDoctorProfileQuery() {
  return useQuery({
    queryKey: DOCTOR_QUERY_KEY,
    queryFn: () => apiGet<DoctorProfileResponse>("/api/v1/doctor/profile"),
    retry: false,
    throwOnError: false,
  });
}

export function useDoctorLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiPost<{ success: true }>("/api/v1/doctor/login", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_QUERY_KEY });
    },
  });
}

export function useDoctorLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ success: true }>("/api/v1/doctor/logout", {}),
    onSuccess: () => {
      qc.setQueryData(DOCTOR_QUERY_KEY, null);
    },
    onError: () => {
      qc.setQueryData(DOCTOR_QUERY_KEY, null);
    },
  });
}

export function getDoctorErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
