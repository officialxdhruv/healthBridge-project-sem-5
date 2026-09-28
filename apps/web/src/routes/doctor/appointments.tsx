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
import { api } from "@/lib/api";
import { calculateAge, formatSlotDate } from "@/lib/dates";
import { doctorAppointmentsQueryOptions } from "@/lib/doctor";

export const Route = createFileRoute("/doctor/appointments")({
  component: DoctorAppointments,
  head: () => ({ meta: [{ title: "Doctor Appointments | HealthBridge" }] }),
});

function DoctorAppointments() {
  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading } = useQuery(
    doctorAppointmentsQueryOptions(),
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["doctor", "appointments"] });
    queryClient.invalidateQueries({ queryKey: ["doctor", "dashboard"] });
  };

  const { mutate: cancelAppointment } = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.post("/api/v1/doctor/cancel-appointment", { appointmentId });
    },
    onSuccess: () => {
      toast.success("Appointment cancelled");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const { mutate: completeAppointment } = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.post("/api/v1/doctor/complete-appointment", { appointmentId });
    },
    onSuccess: () => {
      toast.success("Appointment completed");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return <p className="m-5 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Meet Link</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Date & Time</TableHead>
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
              <TableCell>
                {appointment.meetLink ? (
                  <a
                    href={appointment.meetLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline">
                      Join Meet
                    </Button>
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Not generated
                  </span>
                )}
              </TableCell>
              <TableCell>{calculateAge(appointment.userData.dob)}</TableCell>
              <TableCell>
                {formatSlotDate(appointment.slotDate)}, {appointment.slotTime}
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => completeAppointment(appointment.id)}
                    >
                      Complete
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
