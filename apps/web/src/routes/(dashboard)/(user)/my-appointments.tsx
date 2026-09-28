import type { Appointment } from "@healthbridge/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@healthbridge/ui/components/ui/avatar";
import { Button } from "@healthbridge/ui/components/ui/button";
import { Card, CardContent } from "@healthbridge/ui/components/ui/card";
import { Skeleton } from "@healthbridge/ui/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import type { RazorpayOrderOptions } from "react-razorpay";
import { toast } from "sonner";
import { api } from "../../../lib/api.ts";
import { formatSlotDate } from "../../../lib/dates.ts";
import { loadRazorpay } from "../../../lib/razorpay.ts";
import { myAppointmentsQueryOptions } from "../../../lib/user.ts";

export const Route = createFileRoute("/(dashboard)/(user)/my-appointments")({
  // beforeLoad: requireUser,
  component: MyAppointments,
  head: () => ({ meta: [{ title: "My Appointments | HealthBridge" }] }),
  // loader: ({ context }) =>
  //   context.queryClient.ensureQueryData(myAppointmentsQueryOptions()),
});

function MyAppointments() {
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery(
    myAppointmentsQueryOptions(),
  );

  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.post("/api/v1/user/cancel-appointment", { appointmentId });
    },
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const payAppointment = useMutation({
    mutationFn: async (appointment: Appointment) => {
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
      if (!key) throw new Error("Payments not configured");

      const Razorpay = await loadRazorpay();
      if (!Razorpay) throw new Error("Payments not configured");

      const { order } = await api.post<{
        order: { id: string; amount: number; currency: "INR" };
      }>("/api/v1/user/create-razorpay-order", {
        appointmentId: appointment.id,
      });

      await new Promise<void>((resolve, reject) => {
        const options: RazorpayOrderOptions = {
          key,
          amount: order.amount,
          currency: order.currency,
          name: "HealthBridge",
          description: "Appointment Payment",
          order_id: order.id,
          prefill: {
            name: appointment.userData.name,
            email: appointment.userData.email,
            contact: appointment.userData.phone ?? "",
          },
          theme: {
            color: "#000000",
          },
          handler: async (response) => {
            try {
              await api.post("/api/v1/user/verify-razorpay-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        };

        const rzp = new Razorpay(options);
        rzp.on("payment.failed", (response) => {
          reject(
            new Error(
              response.error.description || "Payment failed. Please try again.",
            ),
          );
        });
        rzp.open();
      });
    },
    onSuccess: () => {
      toast.success("Payment successful");
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (error: Error) => {
      if (error.message !== "Payment cancelled") {
        toast.error(error.message);
      }
    },
  });

  return (
    <div className="space-y-4 pt-5">
      <p className="pb-3 text-lg font-medium">My Appointments</p>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent>
                <div className="flex gap-4">
                  <Skeleton className="size-20 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {appointments?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No appointments yet. Browse doctors to book your first visit.
            </p>
          )}
          {appointments?.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <div className="flex gap-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg">
                    <Avatar className="size-20 shrink-0">
                      <AvatarImage
                        src={item.docData.image || undefined}
                        alt={item.docData.name}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {item.docData.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold">
                      {item.docData.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.docData.speciality}
                    </p>
                    <p className="mt-1 text-sm">
                      <span className="font-medium">Date & Time: </span>
                      {formatSlotDate(item.slotDate)} | {item.slotTime}
                    </p>
                    {item.meetLink && (
                      <a
                        href={item.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="size-3.5" />
                        Join Google Meet
                      </a>
                    )}
                  </div>

                  <div className="flex w-50 flex-col justify-center gap-2">
                    {item.cancelled ? (
                      <Button variant="destructive" className="w-full">
                        Cancelled
                      </Button>
                    ) : item.isCompleted ? (
                      <Button variant="secondary" className="w-full">
                        Completed
                      </Button>
                    ) : (
                      <>
                        {!item.payment ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={payAppointment.isPending}
                            onClick={() => payAppointment.mutate(item)}
                          >
                            Pay Online
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                          >
                            Paid
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          disabled={
                            cancelAppointment.isPending ||
                            payAppointment.isPending
                          }
                          onClick={() => cancelAppointment.mutate(item.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
