import { Button } from "@healthbridge/ui/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminLogoutMutation, useAdminProfileQuery } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const profile = useAdminProfileQuery();
  const logout = useAdminLogoutMutation();

  useEffect(() => {
    if (profile.error) {
      const status =
        profile.error instanceof ApiError ? profile.error.status : undefined;
      if (status === 401) {
        navigate({ to: "/admin/login" });
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
        <h1 className="text-2xl font-semibold">Admin Portal</h1>
        <p className="text-sm text-muted-foreground">Sign in required</p>
        <Button onClick={() => navigate({ to: "/admin/login" })}>
          Go to login
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted p-4 text-center">
      <h1 className="text-2xl font-semibold">Admin Portal</h1>
      <p className="text-sm text-muted-foreground">Welcome, admin</p>
      <Button
        variant="outline"
        onClick={async () => {
          await logout.mutateAsync();
          navigate({ to: "/admin/login" });
        }}
        disabled={logout.isPending}
      >
        {logout.isPending ? "Signing out…" : "Sign out"}
      </Button>
    </main>
  );
}
