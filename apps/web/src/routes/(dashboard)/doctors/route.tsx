import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/doctors")({
  component: DoctorsLayout,
});

function DoctorsLayout() {
  return <Outlet />;
}
