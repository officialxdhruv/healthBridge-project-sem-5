import { buttonVariants } from "@healthbridge/ui/components/ui/button";
import { Skeleton } from "@healthbridge/ui/components/ui/skeleton";
import { cn } from "@healthbridge/ui/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DoctorCard } from "@/components/DoctorCard";
import { useDoctors } from "@/hooks/useDoctors";
import { SPECIALITIES } from "@/lib/specialities";

export const Route = createFileRoute("/(dashboard)/doctors/")({
  component: DoctorsPage,
  head: () => ({
    meta: [{ title: "All Doctors | HealthBridge" }],
  }),
});

function DoctorsPage() {
  const { data: doctors, isLoading } = useDoctors();

  return (
    <div className="py-2">
      <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row">
        {/* Specialities */}
        <div className="flex flex-col gap-4 text-sm">
          {SPECIALITIES.map((s) => (
            <Link
              to="/doctors/$speciality"
              params={{ speciality: s }}
              key={s}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-48 justify-start",
              )}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* All doctors */}
        <div className="grid w-full grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))
            : doctors?.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>
      </div>
    </div>
  );
}
