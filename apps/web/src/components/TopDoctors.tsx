import { buttonVariants } from "@healthbridge/ui/components/ui/button";
import { Skeleton } from "@healthbridge/ui/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { useDoctors } from "../hooks/useDoctors.ts";
import { DoctorCard } from "./DoctorCard.tsx";

export function TopDoctors() {
  const { data: doctors, isLoading } = useDoctors();

  return (
    <div className="my-16 flex flex-col items-center gap-4 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctor to Book</h1>
      <p className="text-center text-sm sm:w-1/3">
        Simply browse through our extensive list of trusted doctors
      </p>
      <div className="grid w-full grid-cols-2 gap-4 gap-y-6 px-3 pt-5 sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          : doctors
              ?.slice(0, 10)
              .map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
      </div>
      <Link
        to="/doctors"
        className={buttonVariants({ className: "mt-10", variant: "outline" })}
      >
        More
      </Link>
    </div>
  );
}
