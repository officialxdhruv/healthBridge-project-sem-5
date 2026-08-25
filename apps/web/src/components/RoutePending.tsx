import { Loader2 } from "lucide-react";

export function RoutePending() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}
