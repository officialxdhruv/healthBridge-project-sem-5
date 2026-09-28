import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { Dashboard } from "@/components/dashboard";

export const Route = createRootRoute({
  component: RootComponent,
});

// function RootComponent() {
//   return <Dashboard />;
// }

function RootComponent() {
  return <Outlet />;
}
