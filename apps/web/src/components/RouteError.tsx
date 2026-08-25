import { Button } from "@healthbridge/ui/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export function RouteError() {
  const navigate = useNavigate();

  return (
    <div className="m-10 flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">
        An unexpected error occurred while loading this page.
      </p>
      <Button variant="outline" onClick={() => navigate({ to: "/" })}>
        Go home
      </Button>
    </div>
  );
}
