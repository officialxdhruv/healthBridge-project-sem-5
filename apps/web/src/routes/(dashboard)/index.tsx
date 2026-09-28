import { createFileRoute } from "@tanstack/react-router";
import { Banner } from "@/components/Banner";
import { Header } from "@/components/Header";
import { SpecialityMenu } from "@/components/SpecialityMenu";
import { TopDoctors } from "@/components/TopDoctors";
import { useMeQuery } from "@/lib/user";

export const Route = createFileRoute("/(dashboard)/")({ component: HomePage });

function HomePage() {
  const me = useMeQuery();

  if (me.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
}
