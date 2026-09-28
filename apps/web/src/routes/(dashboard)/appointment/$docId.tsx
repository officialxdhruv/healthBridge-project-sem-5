import { Badge } from "@healthbridge/ui/components/ui/badge";
import { Button } from "@healthbridge/ui/components/ui/button";
import { cn } from "@healthbridge/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { assets } from "@/assets/assets_frontend/assets";
import { RelatedDoctors } from "@/components/RelatedDoctors";
import { useDoctors } from "@/hooks/useDoctors";
import { api } from "@/lib/api";

export const Route = createFileRoute("/(dashboard)/appointment/$docId")({
  // beforeLoad: requireUser,
  component: Appointment,
  head: () => ({ meta: [{ title: "Book Appointment | HealthBridge" }] }),
  // loader: ({ context }) =>
  //   context.queryClient.ensureQueryData(doctorsQueryOptions()),
});

const daysOfWeeks = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function Appointment() {
  const navigate = useNavigate();
  const { docId } = Route.useParams();
  const { data: doctors, isLoading } = useDoctors();
  const docInfo = useMemo(
    () => doctors?.find((doc) => doc.id === docId),
    [doctors, docId],
  );

  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  const { mutate: bookAppointment, isPending } = useMutation({
    mutationFn: async () => {
      const slotDate =
        docSlots[slotIndex]?.[0]?.dateTime.toLocaleDateString("en-CA");
      if (!docId || !slotDate || !slotTime)
        throw new Error("Please select a date and time slot");
      await api.post("/api/v1/user/book-appointment", {
        docId,
        slotDate,
        slotTime,
      });
    },
    onSuccess: () => {
      navigate({ to: "/my-appointments" });
      toast.success("Appointment booked successfully");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Booking failed"),
  });

  const docSlots = useMemo(() => {
    if (!docInfo) return [];

    const today = new Date();
    const allSlots: { dateTime: Date; time: string }[][] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const start = new Date(date);
      if (i === 0) start.setHours(Math.max(today.getHours() + 1, 10), 0, 0, 0);
      else start.setHours(10, 0, 0, 0);

      const end = new Date(date);
      end.setHours(21, 0, 0, 0);

      const dateKey = date.toLocaleDateString("en-CA");
      const bookedSlots = docInfo.slotsBooked?.[dateKey] ?? [];

      const timeSlots: { dateTime: Date; time: string }[] = [];
      const current = new Date(start);

      while (current < end) {
        const time = current.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!bookedSlots.includes(time)) {
          timeSlots.push({ dateTime: new Date(current), time });
        }
        current.setMinutes(current.getMinutes() + 30);
      }

      if (timeSlots.length > 0) {
        allSlots.push(timeSlots);
      }
    }
    return allSlots;
  }, [docInfo]);

  if (isLoading) return <p className="py-8">Loading...</p>;
  if (!docInfo) return <p className="py-8">Doctor not found</p>;

  return (
    <div className="py-6">
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="h-69 w-full shrink-0 md:w-60">
          <img
            className="h-full w-full rounded-xl bg-accent object-contain md:object-cover"
            src={docInfo.image || undefined}
            alt={docInfo.name}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="w-full rounded-xl border border-accent p-6">
            <p className="flex items-center gap-2 text-2xl font-medium">
              {docInfo.name}
              <img src={assets.verified_icon} className="w-5" alt="" />
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <Badge variant="outline">{docInfo.experience}</Badge>
            </div>

            <div className="mt-4">
              <p className="flex items-center gap-1 text-sm font-medium">
                About
                <img src={assets.info_icon} className="w-3" alt="" />
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {docInfo.about}
              </p>
            </div>

            <p className="mt-6 font-medium">
              Appointment fee:
              <span className="ml-1">₹{docInfo.fees}</span>
            </p>
          </div>

          <div className="mt-8">
            <p className="font-medium text-muted-foreground">Booking slots</p>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 w-full">
              {docSlots.map((item, index) => (
                <Button
                  key={index}
                  onClick={() => setSlotIndex(index)}
                  className={cn(
                    // oxlint-disable-next-line shadcn/no-restyle
                    "flex min-w-16 flex-col items-center justify-center px-6 py-10",
                  )}
                  variant={slotIndex === index ? "default" : "outline"}
                >
                  <p>{daysOfWeeks[item[0].dateTime.getDay()]}</p>
                  <p>{item[0].dateTime.getDate()}</p>
                </Button>
              ))}
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {docSlots[slotIndex]?.map((slot, index) => (
                <Button
                  key={index}
                  onClick={() => setSlotTime(slot.time)}
                  size="sm"
                  className="shrink-0"
                  variant={slot.time === slotTime ? "default" : "outline"}
                >
                  {slot.time.toLowerCase()}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => bookAppointment()}
              className="mt-6"
              disabled={!slotTime || isPending}
            >
              {isPending ? "Booking..." : "Book an appointment"}
            </Button>
          </div>
        </div>
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality ?? ""} />
    </div>
  );
}
