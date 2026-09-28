import { Badge } from "@healthbridge/ui/components/ui/badge";
import { Button } from "@healthbridge/ui/components/ui/button";
import { Card, CardContent } from "@healthbridge/ui/components/ui/card";
import { Input } from "@healthbridge/ui/components/ui/input";
import { Label } from "@healthbridge/ui/components/ui/label";
import { Switch } from "@healthbridge/ui/components/ui/switch";
import { Textarea } from "@healthbridge/ui/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { api, backendBaseUrl } from "@/lib/api";
import { useDoctorProfileQuery } from "@/lib/doctor";

export const Route = createFileRoute("/doctor/profile")({
  component: DoctorProfile,
  head: () => ({ meta: [{ title: "Doctor Profile | HealthBridge" }] }),
});

function DoctorProfile() {
  const qc = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fees, setFees] = useState(0);
  const [about, setAbout] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { data: profile, isLoading } = useDoctorProfileQuery();
  const doctor = profile?.doctor;

  const toggleAvailability = async () => {
    if (!doctor) return;
    try {
      await api.post("/api/v1/doctor/change-availability", {});
      await qc.invalidateQueries({ queryKey: ["doctor"] });
      toast.success(
        doctor.available
          ? "You are now unavailable for new bookings"
          : "You are now available for bookings",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const startEdit = () => {
    if (!doctor) return;
    setFees(doctor.fees);
    setAbout(doctor.about);
    setAddress1(doctor.address?.line1 ?? "");
    setAddress2(doctor.address?.line2 ?? "");
    setIsEdit(true);
  };

  const save = async () => {
    if (!doctor) return;
    setSubmitting(true);
    const form = new FormData();
    form.append("name", doctor.name);
    form.append("speciality", doctor.speciality);
    form.append("degree", doctor.degree);
    form.append("experience", doctor.experience);
    form.append("fees", String(fees));
    form.append("about", about);
    form.append(
      "address",
      JSON.stringify({ line1: address1, line2: address2 }),
    );
    try {
      await api.postForm("/api/v1/doctor/update-profile", form);
      toast.success("Profile updated successfully");
      await qc.invalidateQueries({ queryKey: ["doctor"] });
      setIsEdit(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="m-5 text-sm text-muted-foreground">Loading…</p>;
  }
  if (!doctor) return null;

  return (
    <div className="m-5 flex flex-col gap-4 md:flex-row">
      <div className="h-69 shrink-0 md:w-60">
        <img
          className="h-full w-full rounded-2xl object-contain md:object-cover"
          src={doctor.image || undefined}
          alt={doctor.name}
        />
      </div>

      <Card className="flex-1">
        <CardContent>
          <div className="space-y-4">
            <p className="text-3xl font-medium">{doctor.name}</p>

            <div className="flex items-center gap-2">
              <p>
                {doctor.degree} - {doctor.speciality}
              </p>
              <Badge variant="outline">{doctor.experience}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={doctor.available}
                onCheckedChange={toggleAvailability}
              />
              <Label>Available</Label>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Google Calendar</p>
              <Button
                variant="outline"
                render={
                  <a
                    href={`${backendBaseUrl}/api/v1/doctor/google`}
                    target="_blank"
                    rel="noopener"
                  />
                }
              >
                {doctor.isGoogleLinked
                  ? "Reconnect Google Calendar"
                  : "Connect Google Calendar"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Patients get auto-generated Meet links when linked.
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium">About</p>
              {isEdit ? (
                <Textarea
                  rows={8}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{doctor.about}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <p className="font-medium">Appointment fee:</p>
              {isEdit ? (
                <Input
                  type="number"
                  className="max-w-32"
                  value={fees}
                  onChange={(e) => setFees(Number(e.target.value))}
                />
              ) : (
                <p>₹{doctor.fees}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="font-medium">Address</p>
              {isEdit ? (
                <>
                  <Input
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="Address line 1"
                  />
                  <Input
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="Address line 2"
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {doctor.address?.line1}
                  {doctor.address?.line2 && (
                    <>
                      <br />
                      {doctor.address.line2}
                    </>
                  )}
                </p>
              )}
            </div>

            {isEdit ? (
              <div className="flex gap-2">
                <Button onClick={save} disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={() => setIsEdit(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={startEdit}>
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
