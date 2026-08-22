import type { Address, Gender } from "./primitives";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  address?: Address;
  gender?: Gender;
  dob?: string;
  phone?: string;
  isGoogleLinked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Snapshot of the patient stored on the appointment at booking time. */
export type AppointmentUserData = Pick<
  User,
  "name" | "email" | "phone" | "image" | "dob"
>;
