import { Button } from "@healthbridge/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@healthbridge/ui/components/ui/card";
import { Input } from "@healthbridge/ui/components/ui/input";
import { Label } from "@healthbridge/ui/components/ui/label";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { getAdminErrorMessage, useAdminLoginMutation } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = adminLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    try {
      await login.mutateAsync({ email, password });
      toast.success("Admin signed in");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(getAdminErrorMessage(err));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>Sign in to manage HealthBridge</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email ? (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password ? (
                <p className="text-sm text-destructive">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
