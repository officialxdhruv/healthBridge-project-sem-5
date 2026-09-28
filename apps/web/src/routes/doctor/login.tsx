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
  BadgeIndianRupee,
  CalendarDays,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { getDoctorErrorMessage, useDoctorLoginMutation } from "@/lib/doctor";
import { assets } from "@/assets/assets_frontend/assets";
import { AuthShell } from "@/components/auth-shell";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createFileRoute("/doctor/login")({
  component: DoctorLoginPage,
});

const doctorLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const doctorHighlights = [
  {
    icon: CalendarDays,
    title: "Your schedule, sorted",
    description: "Upcoming and past appointments in one table.",
  },
  {
    icon: Video,
    title: "Meet built in",
    description: "Every booking carries its own Meet link.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Track earnings",
    description: "See paid consultations add up live.",
  },
];

function DoctorLoginPage() {
  useDocumentTitle("Doctor sign in | HealthBridge");
  const navigate = useNavigate();
  const login = useDoctorLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = doctorLoginSchema.safeParse({ email, password });
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
      toast.success("Doctor signed in");
      navigate({ to: "/doctor" });
    } catch (err) {
      toast.error(getDoctorErrorMessage(err));
    }
  }

  return (
    <AuthShell
      image={assets.contact_image}
      imageAlt="Doctor consultation"
      brand="HealthBridge Doctor"
      headline="Your practice, organized"
      subheading="Schedule, consultations, and earnings — everything in one place."
      highlights={doctorHighlights}
      footerNote="© 2026 HealthBridge Doctor. For registered practitioners."
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Doctor Portal</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to manage appointments
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
              placeholder="doctor@example.com"
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
