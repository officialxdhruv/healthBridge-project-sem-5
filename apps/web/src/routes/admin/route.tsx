import { Button } from "@healthbridge/ui/components/ui/button";
import {
  Link,
  Outlet,
  createFileRoute,
  useMatch,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { adminDashboardQueryOptions } from "@/lib/admin";
import { useAdminLogoutMutation } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { cn } from "@healthbridge/ui/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminShell,
});

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/admin/add-doctor", label: "Add Doctor", icon: UserPlus },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
] as const;

function AdminShell() {
  const navigate = useNavigate();
  const logout = useAdminLogoutMutation();
  const isLoginPage = useMatch({
    from: "/admin/login",
    shouldThrow: false,
  });
  const session = useQuery({
    ...adminDashboardQueryOptions(),
    retry: false,
    enabled: !isLoginPage,
  });

  useEffect(() => {
    if (session.error) {
      const status =
        session.error instanceof ApiError ? session.error.status : undefined;
      if (status === 401) {
        navigate({ to: "/admin/login" });
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
        <h1 className="text-2xl font-semibold">Admin Portal</h1>
        <p className="text-sm text-muted-foreground">Sign in required</p>
        <Button onClick={() => navigate({ to: "/admin/login" })}>
          Go to login
        </Button>
      </main>
    );
  }

  const signOut = async () => {
    await logout.mutateAsync().catch(() => undefined);
    toast.success("Signed out");
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r bg-muted/40 p-4">
        <p className="px-2 pb-4 text-lg font-semibold">HealthBridge Admin</p>
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
