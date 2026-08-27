import { Button } from "@healthbridge/ui/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ApiError } from "@/lib/api";
import {
  useDoctorLogoutMutation,
  useDoctorProfileQuery,
} from "@/lib/doctor-auth";

export const Route = createFileRoute("/doctor/")({
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const navigate = useNavigate();
  const profile = useDoctorProfileQuery();
  const logout = useDoctorLogoutMutation();

  useEffect(() => {
    if (profile.error) {
      const status =
        profile.error instanceof ApiError ? profile.error.status : undefined;
      if (status === 401) {
        navigate({ to: "/doctor/login" });
      }
    }
  }, [profile.error, navigate]);

  if (profile.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (profile.isError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted p-4 text-center">
        <h1 className="text-2xl font-semibold">Doctor Portal</h1>
        <p className="text-sm text-muted-foreground">Sign in required</p>
        <Button onClick={() => navigate({ to: "/doctor/login" })}>
          Go to login
        </Button>
      </main>
    );
  }

  const doctor = profile.data.doctor;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted p-4 text-center">
      <h1 className="text-2xl font-semibold">Doctor Portal</h1>
      <p className="text-sm text-muted-foreground">
        Welcome, {doctor.name} · {doctor.speciality}
      </p>
      <Button
        variant="outline"
        onClick={async () => {
          await logout.mutateAsync();
          navigate({ to: "/doctor/login" });
        }}
        disabled={logout.isPending}
      >
        {logout.isPending ? "Signing out…" : "Sign out"}
      </Button>
    </main>
  );
}
