import { Button } from "@healthbridge/ui/components/ui/button";
import { Input } from "@healthbridge/ui/components/ui/input";
import { Label } from "@healthbridge/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@healthbridge/ui/components/ui/select";
import { Textarea } from "@healthbridge/ui/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { assets } from "@/assets/assets_frontend/assets";
import { api } from "@/lib/api";
import { SPECIALITIES } from "@/lib/specialities";

export const Route = createFileRoute("/admin/add-doctor")({
  component: AddDoctor,
  head: () => ({ meta: [{ title: "Add Doctor | HealthBridge" }] }),
});

const experiences = Array.from(
  { length: 10 },
  (_, i) => `${i + 1} Year${i > 0 ? "s" : ""}`,
);

const emptyForm = {
  name: "",
  email: "",
  password: "",
  experience: "1 Year",
  fees: "0",
  about: "",
  speciality: "General physician",
  degree: "",
  address1: "",
  address2: "",
};

function AddDoctor() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [docImg, setDocImg] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docImg) {
      toast.error("Please select an image");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append("image", docImg);
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("password", form.password);
    fd.append("experience", form.experience);
    fd.append("fees", form.fees);
    fd.append("about", form.about);
    fd.append("speciality", form.speciality);
    fd.append("degree", form.degree);
    fd.append("address1", form.address1);
    fd.append("address2", form.address2);
    try {
      await api.postForm("/api/v1/admin/add-doctor", fd);
      toast.success("Doctor added successfully");
      setForm(emptyForm);
      setDocImg(null);
      setPreview(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add doctor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="m-5">
      <form onSubmit={onSubmit} className="h-full w-full">
        <div className="flex w-fit flex-col items-center gap-4">
          <input
            ref={fileInputRef}
            id="doc-img"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setDocImg(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
            type="file"
            accept="image/*"
            hidden
          />
          <Label htmlFor="doc-img" className="cursor-pointer">
            <img
              className="size-35 rounded-full border-2 border-primary object-contain"
              src={preview ?? assets.upload_icon}
              alt="Upload doctor"
            />
          </Label>

          <Button
            variant="ghost"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </Button>
        </div>

        <div className="mt-4 flex flex-col items-start gap-10 lg:flex-row">
          <div className="flex w-full flex-col gap-4 lg:flex-1">
            <div className="flex flex-col gap-1">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={set("name")}
                placeholder="Name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="Email"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="Password"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Experience</Label>
              <Select
                value={form.experience}
                onValueChange={(value) =>
                  setForm({ ...form, experience: value ?? form.experience })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {experiences.map((exp) => (
                    <SelectItem key={exp} value={exp}>
                      {exp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Fees</Label>
              <Input
                type="number"
                value={form.fees}
                onChange={set("fees")}
                placeholder="Doctor fees"
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 lg:flex-1">
            <div className="flex flex-col gap-1">
              <Label>Speciality</Label>
              <Select
                value={form.speciality}
                onValueChange={(value) =>
                  setForm({ ...form, speciality: value ?? form.speciality })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Degree</Label>
              <Input
                value={form.degree}
                onChange={set("degree")}
                placeholder="Degree"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Address</Label>
              <Input
                value={form.address1}
                onChange={set("address1")}
                placeholder="Address line 1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Input
                value={form.address2}
                onChange={set("address2")}
                placeholder="Address line 2"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 mt-4">About Doctor</p>
          <Textarea
            value={form.about}
            onChange={set("about")}
            rows={5}
            placeholder="Write about doctor"
          />
        </div>

        <Button type="submit" disabled={submitting} className="mt-4">
          {submitting ? "Adding..." : "Add Doctor"}
        </Button>
      </form>
    </div>
  );
}
