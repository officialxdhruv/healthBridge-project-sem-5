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
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { getAuthErrorMessage, useRegisterMutation } from "@/lib/user";
import { assets } from "@/assets/assets_frontend/assets";
import { AuthShell } from "@/components/auth-shell";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createFileRoute("/(auth)/register")({
  component: RegisterPage,
});

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

function RegisterPage() {
  useDocumentTitle("Create account | HealthBridge");
  const navigate = useNavigate();
  const register = useRegisterMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ name, email, password });
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
      await register.mutateAsync({ name, email, password });
      toast.success("Account created — please sign in");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    }
  }

  return (
    <AuthShell image={assets.header_img} imageAlt="Healthcare professionals">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create account
        </h2>
        <p className="text-sm text-muted-foreground">
          Join HealthBridge in seconds
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>
                <User />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="name"
              placeholder="Aryan Sharma"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
            />
          </InputGroup>
          {fieldErrors.name ? (
            <p className="text-sm text-destructive">{fieldErrors.name}</p>
          ) : null}
        </div>

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
              placeholder="you@example.com"
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
              autoComplete="new-password"
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
          <p className="text-xs text-muted-foreground">At least 8 characters</p>
        </div>

        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
