import { Button } from "@healthbridge/ui/components/ui/button";
import { cn } from "@healthbridge/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createFileRoute,
  useMatch,
  useNavigate,
} from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, LogOut, User } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useDoctorLogoutMutation } from "@/lib/doctor";
import { doctorProfileQueryOptions } from "@/lib/doctor";

export const Route = createFileRoute("/doctor")({
  component: DoctorShell,
});

const navItems = [
  { to: "/doctor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/doctor/profile", label: "Profile", icon: User },
] as const;

function DoctorShell() {
  const navigate = useNavigate();
  const logout = useDoctorLogoutMutation();
  const isLoginPage = useMatch({
    from: "/doctor/login",
    shouldThrow: false,
  });
  const session = useQuery({
    ...doctorProfileQueryOptions(),
    enabled: !isLoginPage,
  });

  useEffect(() => {
    if (session.error) {
      const status =
        session.error instanceof ApiError ? session.error.status : undefined;
      if (status === 401) {
        navigate({ to: "/doctor/login" });
      }
    }
  }, [session.error, navigate]);

  if (isLoginPage) {
    return <Outlet />;
  }

  if (session.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (session.isError) {
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

  const signOut = async () => {
    await logout.mutateAsync().catch(() => undefined);
    toast.success("Signed out");
    navigate({ to: "/doctor/login" });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-r bg-muted/40 p-4">
        <p className="px-2 pb-4 text-lg font-semibold">HealthBridge Doctor</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-accent text-accent-foreground" }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              "text-muted-foreground transition-colors hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
        <div className="mt-auto pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={signOut}
            disabled={logout.isPending}
          >
            <LogOut className="size-4" />
            {logout.isPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
