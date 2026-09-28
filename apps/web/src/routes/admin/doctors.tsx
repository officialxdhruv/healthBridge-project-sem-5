import { Card, CardContent } from "@healthbridge/ui/components/ui/card";
import { Toggle } from "@healthbridge/ui/components/ui/toggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { adminDoctorsQueryOptions } from "@/lib/admin";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/doctors")({
  component: AdminDoctors,
  head: () => ({ meta: [{ title: "Admin Doctors | HealthBridge" }] }),
});

function AdminDoctors() {
  const queryClient = useQueryClient();
  const { data: doctors = [], isLoading } = useQuery(
    adminDoctorsQueryOptions(),
  );

  const { mutate: changeAvailability } = useMutation({
    mutationFn: async (docId: string) => {
      await api.post("/api/v1/admin/change-availability", { docId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return <p className="m-5 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="m-5">
      <div className="grid w-full grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
        {doctors.map((doctor) => (
          <Card className="overflow-hidden" key={doctor.id}>
            <div className="h-48 w-full overflow-hidden">
              <img
                className="h-full w-full object-cover"
                src={doctor.image || undefined}
                alt={doctor.name}
              />
            </div>
            <CardContent>
              <div className="flex flex-col gap-1">
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
                <Toggle
                  pressed={doctor.available}
                  onPressedChange={() => changeAvailability(doctor.id)}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  Available
                </Toggle>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
