import { buttonVariants } from "@healthbridge/ui/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useDoctors } from "../hooks/useDoctors.ts";
import { DoctorCard } from "./DoctorCard.tsx";

export function RelatedDoctors({
  docId,
  speciality,
}: {
  docId: string;
  speciality: string;
}) {
  const { data: doctors = [] } = useDoctors();

  const relatedDoctors = doctors
    .filter((doc) => doc.speciality === speciality && doc.id !== docId)
    .slice(0, 5);

  return (
    <div className="my-16 flex flex-col items-center gap-4 md:mx-10">
      <h1 className="text-3xl font-medium">Related Doctors</h1>
      <p className="text-center text-sm sm:w-1/3">
        Simply browse through our extensive list of trusted doctors
      </p>
      <div className="grid w-full grid-cols-2 gap-4 gap-y-6 px-3 pt-5 sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
        {relatedDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
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
