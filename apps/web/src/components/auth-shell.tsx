import { Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarRange, CreditCard, Video } from "lucide-react";
import type { ReactNode } from "react";

const defaultHighlights = [
  {
    icon: CalendarCheck,
    title: "Instant slot booking",
    description: "Real-time availability across trusted doctors.",
  },
  {
    icon: Video,
    title: "Online consultations",
    description: "Meet links generated automatically for every visit.",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    description: "Pay online with Razorpay or at the clinic.",
  },
];

type Highlight = {
  icon: typeof CalendarCheck;
  title: string;
  description: string;
};

export function AuthShell({
  image,
  imageAlt,
  brand = "HealthBridge",
  headline = "Care that comes to you",
  subheading = "Book trusted doctors, consult online, and manage every appointment in one place.",
  highlights = defaultHighlights,
  footerNote = "© 2026 HealthBridge. Your health, simplified.",
  children,
}: {
  image: string;
  imageAlt: string;
  brand?: string;
  headline?: string;
  subheading?: string;
  highlights?: Highlight[];
  footerNote?: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between gap-6 overflow-hidden bg-primary p-8 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <CalendarRange className="size-6" />
          {brand}
        </Link>

        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {headline}
            </h1>
            <p className="max-w-md text-sm text-primary-foreground/80">
              {subheading}
            </p>
          </div>

          <div className="flex justify-center">
            <img
              src={image}
              alt={imageAlt}
              className="aspect-square max-h-64 w-auto rounded-full border-4 border-primary-foreground/20 object-cover"
            />
          </div>

          <ul className="space-y-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="rounded-lg bg-primary-foreground/15 p-1.5">
                  <Icon className="size-4" />
                </span>
                <span>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-primary-foreground/75">
                    {description}
                  </p>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primary-foreground/70">{footerNote}</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm space-y-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold lg:hidden"
          >
            <CalendarRange className="size-6" />
            {brand}
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}
