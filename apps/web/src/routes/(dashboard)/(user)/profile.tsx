import type { Gender, User } from "@healthbridge/types";
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
import { Input } from "@healthbridge/ui/components/ui/input";
import { Label } from "@healthbridge/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@healthbridge/ui/components/ui/select";
import { Skeleton } from "@healthbridge/ui/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../lib/api.ts";
import { profileQueryOptions } from "../../../lib/user.ts";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createFileRoute("/(dashboard)/(user)/profile")({
  component: ProfilePage,
});

type ProfileForm = {
  name: string;
  phone: string;
  address: { line1: string; line2: string };
  gender: Gender;
  dob: string;
};

function buildForm(user: User): ProfileForm {
  return {
    name: user.name,
    phone: user.phone ?? "",
    address: {
      line1: user.address?.line1 ?? "",
      line2: user.address?.line2 ?? "",
    },
    gender: user.gender ?? "Not Selected",
    dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
  };
}

function ProfilePage() {
  useDocumentTitle("My Profile | HealthBridge");
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery(profileQueryOptions());

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async () => {
      if (!userData || !form) return;
      const data = new FormData();
      data.append("name", form.name);
      data.append("phone", form.phone);
      data.append(
        "address",
        JSON.stringify({
          line1: form.address.line1,
          line2: form.address.line2,
        }),
      );
      data.append("gender", form.gender);
      data.append("dob", form.dob);
      if (image) data.append("image", image);
      await api.postForm("/api/v1/user/update-profile", data);
    },
    onSuccess: async () => {
      toast.success("Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEdit(false);
      setImage(null);
      setPreview(null);
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Update failed"),
  });

  if (isLoading)
    return (
      <div className="space-y-6 pt-5">
        <div className="overflow-hidden rounded-xl">
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="overflow-hidden rounded-xl">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  if (!userData) return null;

  const startEdit = () => {
    setForm(buildForm(userData));
    setIsEdit(true);
  };

  return (
    <div className="max-w-2xl space-y-6 pt-5">
      <Card>
        <CardContent>
          <div className="flex items-center gap-6 pt-6">
            {isEdit ? (
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="image" className="cursor-pointer">
                  <div className="rounded-full border-2 border-primary">
                    <Avatar className="size-24">
                      <AvatarImage
                        src={preview ?? (userData.image || undefined)}
                        alt={userData.name}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {userData.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  id="image"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImage(file);
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </Button>
              </div>
            ) : (
              <Avatar className="size-24">
                <AvatarImage
                  src={userData.image || undefined}
                  alt={userData.name}
                  className="object-cover"
                />
                <AvatarFallback>
                  {userData.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1">
              {isEdit && form ? (
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              ) : (
                <p className="text-2xl font-semibold">{userData.name}</p>
              )}
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_2fr] gap-y-4 text-sm">
            <p className="font-medium text-muted-foreground">Email</p>
            <p>{userData.email}</p>

            <p className="font-medium text-muted-foreground">Phone</p>
            {isEdit && form ? (
              <Input
                className="max-w-52"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            ) : (
              <p>{userData.phone ?? "Not set"}</p>
            )}

            <p className="font-medium text-muted-foreground">Address</p>
            {isEdit && form ? (
              <div className="grid gap-2">
                <Input
                  value={form.address.line1}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, line1: e.target.value },
                    })
                  }
                  placeholder="Address line 1"
                />
                <Input
                  value={form.address.line2}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, line2: e.target.value },
                    })
                  }
                  placeholder="Address line 2"
                />
              </div>
            ) : (
              <p>
                {userData.address?.line1}
                {userData.address?.line2 && (
                  <>
                    <br />
                    {userData.address.line2}
                  </>
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_2fr] gap-y-4 text-sm">
            <p className="font-medium text-muted-foreground">Gender</p>
            {isEdit && form ? (
              <Select
                value={form.gender}
                onValueChange={(value) =>
                  setForm({ ...form, gender: value as Gender })
                }
              >
                <SelectTrigger className="w-45">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Selected">Not Selected</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p>{userData.gender}</p>
            )}

            <p className="font-medium text-muted-foreground">Birthday</p>
            {isEdit && form ? (
              <Input
                className="max-w-45"
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            ) : (
              <p>
                {userData.dob
                  ? new Date(String(userData.dob)).toLocaleDateString()
                  : "Not set"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {isEdit ? (
          <>
            <Button onClick={() => updateProfile()} disabled={isPending}>
              {isPending ? "Saving..." : "Save information"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEdit(false);
                setPreview(null);
                setImage(null);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={startEdit}>Edit</Button>
        )}
      </div>
    </div>
  );
}
