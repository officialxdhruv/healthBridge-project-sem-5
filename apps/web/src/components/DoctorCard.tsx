import type { Doctor } from "@healthbridge/types";
import { Card, CardContent } from "@healthbridge/ui/components/ui/card";
import { Link } from "@tanstack/react-router";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link to="/appointment/$docId" params={{ docId: doctor.id }}>
      <div className="transition-all duration-500 hover:-translate-y-2.5">
        {/* oxlint-disable-next-line shadcn/no-restyle */}
        <Card className="overflow-hidden pt-0">
          <div className="h-48 w-full overflow-hidden">
            <img
              className="h-full w-full bg-accent object-contain"
              src={doctor.image || undefined}
              alt={doctor.name}
            />
          </div>
          <CardContent>
            <div className="pt-3">
              <div className="flex items-center gap-2 text-sm">
                <p
                  className={`size-2 rounded-full ${doctor.available ? "bg-green-500" : "bg-red-500"}`}
                />
                <p
                  className={
                    doctor.available ? "text-green-500" : "text-red-500"
                  }
                >
                  {doctor.available ? "Available" : "Not Available"}
                </p>
              </div>
              <p className="text-lg font-medium">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">
                {doctor.speciality}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
