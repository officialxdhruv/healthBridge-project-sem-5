import { Dashboard } from "@/components/dashboard";
import { createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return <Dashboard />;
}
