import { Button, buttonVariants } from "@healthbridge/ui/components/ui/button";
import { cn } from "@healthbridge/ui/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLogoutMutation, useMeQuery } from "@/lib/auth";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const me = useMeQuery();
  const logout = useLogoutMutation();

  const user = me.data?.user;

  if (me.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted p-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome, {user.name}
        </h1>
        <p className="text-muted-foreground">{user.email}</p>
        <Button
          variant="outline"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted p-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">HealthBridge</h1>
      <p className="max-w-md text-muted-foreground">
        Book appointments with trusted doctors. Sign in or create an account to
        get started.
      </p>
      <div className="flex gap-3">
        <Link to="/login" className={cn(buttonVariants())}>
          Sign in
        </Link>
        <Link
          to="/register"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Create account
        </Link>
      </div>
    </main>
  );
}
