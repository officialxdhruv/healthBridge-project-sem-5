export type Role = "user" | "doctor" | "admin";

export type Gender = "Male" | "Female" | "Other" | "Not Selected";

export interface Address {
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
}

/** Stored OAuth tokens from Google (never exposed to clients). */
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

/** Occupied appointment slots: date string (YYYY-MM-DD) → time slots. */
export type SlotsBooked = Record<string, string[]>;
