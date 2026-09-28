import type { Appointment, Doctor } from "@healthbridge/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiPost } from "./api";

export type AdminDashData = {
  doctors: number;
  appointments: number;
  patients: number;
  latestAppointments: Appointment[];
};

const ADMIN_QUERY_KEY = ["admin"] as const;

export function adminDashboardQueryOptions() {
  return {
    queryKey: ["admin", "dashboard"] as const,
    queryFn: async () => {
      const res = await apiGet<{ dashData: AdminDashData }>(
        "/api/v1/admin/dashboard",
      );
      return res.dashData;
    },
  };
}

export function adminAppointmentsQueryOptions() {
  return {
    queryKey: ["admin", "appointments"] as const,
    queryFn: async () => {
      const res = await apiGet<{ appointments: Appointment[] }>(
        "/api/v1/admin/appointments",
      );
      return res.appointments;
    },
  };
}

export function adminDoctorsQueryOptions() {
  return {
    queryKey: ["admin", "doctors"] as const,
    queryFn: async () => {
      const res = await apiGet<{ doctors: Omit<Doctor, "email">[] }>(
        "/api/v1/admin/all-doctors",
      );
      return res.doctors;
    },
  };
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
