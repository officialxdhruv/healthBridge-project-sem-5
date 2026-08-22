import type { Address, SlotsBooked } from "./primitives";

export interface Doctor {
  id: string;
  name: string;
  email: string;
  image: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  available: boolean;
  fees: number;
  address: Address;
  slotsBooked: SlotsBooked;
  isGoogleLinked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Snapshot of the doctor stored on the appointment at booking time. */
export type AppointmentDocData = Pick<
  Doctor,
  "name" | "email" | "speciality" | "image"
>;
