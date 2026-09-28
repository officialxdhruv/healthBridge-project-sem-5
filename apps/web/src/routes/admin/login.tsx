import { Button } from "@healthbridge/ui/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@healthbridge/ui/components/ui/input-group";
import { Label } from "@healthbridge/ui/components/ui/label";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  CalendarDays,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { getAdminErrorMessage, useAdminLoginMutation } from "@/lib/admin";
import { assets } from "@/assets/assets_frontend/assets";
import { AuthShell } from "@/components/auth-shell";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

const adminLoginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const adminHighlights = [
  {
    icon: Users,
    title: "Manage doctors",
    description: "Add doctors and control availability in one place.",
  },
  {
    icon: CalendarDays,
    title: "Oversee appointments",
    description: "Monitor every booking across the platform.",
  },
  {
    icon: Activity,
    title: "Platform insights",
    description: "Doctors, patients, and bookings at a glance.",
  },
];

function AdminLoginPage() {
  useDocumentTitle("Admin sign in | HealthBridge");
  const navigate = useNavigate();
  const login = useAdminLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthShell
      image={assets.about_image}
      imageAlt="Clinic team"
      brand="HealthBridge Admin"
      headline="Run the whole clinic"
      subheading="Doctors, appointments, and platform insights — one command center."
      highlights={adminHighlights}
      footerNote="© 2026 HealthBridge Admin. Restricted access."
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Admin Portal</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to manage HealthBridge
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>
                <Mail />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </InputGroup>
          {fieldErrors.email ? (
            <p className="text-sm text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>
                <Lock />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {fieldErrors.password ? (
            <p className="text-sm text-destructive">{fieldErrors.password}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/"
            className="text-primary underline-offset-4 hover:underline"
          >
            Back to HealthBridge home
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
