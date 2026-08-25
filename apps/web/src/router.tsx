import type { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { RouteError } from "./components/RouteError.tsx";
import { RoutePending } from "./components/RoutePending.tsx";
import { routeTree } from "./routeTree.gen";

export function createRouter(queryClient: QueryClient) {
  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RoutePending,
    defaultErrorComponent: RouteError,
    context: { queryClient },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
