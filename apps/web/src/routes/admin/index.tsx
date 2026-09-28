import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@healthbridge/ui/components/ui/avatar";
import { Button } from "@healthbridge/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@healthbridge/ui/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Stethoscope, Users } from "lucide-react";
import { toast } from "sonner";
import { adminDashboardQueryOptions } from "@/lib/admin";
import { api } from "@/lib/api";
import { formatSlotDate } from "@/lib/dates";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  useDocumentTitle("Admin Dashboard | HealthBridge");
  const queryClient = useQueryClient();
  const { data: dashData, isLoading } = useQuery(adminDashboardQueryOptions());

  const { mutate: cancelAppointment } = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.post("/api/v1/admin/cancel-appointment", { appointmentId });
    },
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return <p className="m-5 text-sm text-muted-foreground">Loading…</p>;
  }
  if (!dashData) return null;

  const stats = [
    { label: "Doctors", value: dashData.doctors, icon: Stethoscope },
    { label: "Appointments", value: dashData.appointments, icon: CalendarDays },
    { label: "Patients", value: dashData.patients, icon: Users },
  ];

  return (
    <div className="m-5 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent>
              <div className="flex items-center gap-4">
                <Icon className="size-10 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dashData.latestAppointments?.length === 0 && (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
            {dashData.latestAppointments.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b py-2 last:border-0"
              >
                <Avatar>
                  <AvatarImage
                    src={item.userData.image || undefined}
                    alt={item.userData.name}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {item.userData.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{item.userData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Booking on {formatSlotDate(item.slotDate)}
                  </p>
                </div>
                {item.cancelled ? (
                  <span className="text-xs font-medium text-destructive">
                    Cancelled
                  </span>
                ) : item.isCompleted ? (
                  <span className="text-xs font-medium text-green-500">
                    Completed
                  </span>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelAppointment(item.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
