import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@healthbridge/ui/components/ui/avatar";
import { Button } from "@healthbridge/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@healthbridge/ui/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { adminAppointmentsQueryOptions } from "@/lib/admin";
import { api } from "@/lib/api";
import { calculateAge, formatSlotDate } from "@/lib/dates";

export const Route = createFileRoute("/admin/appointments")({
  component: AdminAppointments,
  head: () => ({ meta: [{ title: "Admin Appointments | HealthBridge" }] }),
});

function AdminAppointments() {
  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading } = useQuery(
    adminAppointmentsQueryOptions(),
  );

  const { mutate: cancelAppointment } = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.post("/api/v1/admin/cancel-appointment", { appointmentId });
    },
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return <p className="m-5 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="m-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Fees</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment, index) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointments.length - index}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={appointment.userData.image || undefined}
                      alt={appointment.userData.name}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {appointment.userData.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p>{appointment.userData.name}</p>
                </div>
              </TableCell>
              <TableCell>{calculateAge(appointment.userData.dob)}</TableCell>
              <TableCell>
                {formatSlotDate(appointment.slotDate)} {appointment.slotTime}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={appointment.docData.image || undefined}
                      alt={appointment.docData.name}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {appointment.docData.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p>{appointment.docData.name}</p>
                </div>
              </TableCell>
              <TableCell>₹{appointment.amount}</TableCell>
              <TableCell>
                {appointment.cancelled ? (
                  <span className="text-xs font-medium text-destructive">
                    Cancelled
                  </span>
                ) : appointment.isCompleted ? (
                  <span className="text-xs font-medium text-green-500">
                    Completed
                  </span>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
