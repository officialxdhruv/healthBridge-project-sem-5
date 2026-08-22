import type { AppointmentDocData } from "./doctor";
import type { AppointmentUserData } from "./user";

export interface Appointment {
  id: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  userData: AppointmentUserData;
  docData: AppointmentDocData;
  amount: number;
  cancelled: boolean;
  payment: boolean;
  isCompleted: boolean;
  meetLink?: string;
  googleEventId?: string;
  createdAt?: string;
  updatedAt?: string;
}
