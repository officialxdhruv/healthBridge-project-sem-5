import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/")({ component: UnderConstruction });

function UnderConstruction() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Construction className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Page under construction
      </h1>
      <p className="max-w-md text-muted-foreground">
        We're working hard to build this page. Please check back soon.
      </p>
    </main>
  );
}
