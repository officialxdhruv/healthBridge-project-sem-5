import { createHmac, timingSafeEqual } from "node:crypto";
import type { GoogleTokens } from "@healthbridge/types";
import { addMinutes, format, parse } from "date-fns";
import { type calendar_v3, google } from "googleapis";
import { env } from "@/env";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

/** How long a signed state value remains valid for the OAuth round-trip. */
const STATE_TTL_MS = 5 * 60 * 1000;

/** Tolerated clock skew into the future when checking the issued timestamp. */
const STATE_FUTURE_SKEW_MS = 60 * 1000;

function sign(parts: string[]): string {
  return createHmac("sha256", env.GOOGLE_STATE_SECRET)
    .update(parts.join("."))
    .digest("hex");
}

/** Sign a `state` value that binds the OAuth round-trip to a doctor session. */
export function signGoogleState(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign([payload])}`;
}

/** Verify a state value and reject stale/forged round-trips (CSRF guard). */
export function verifyGoogleState(state: string, userId: string): boolean {
  const parts = state.split(".");
  if (parts.length !== 3) return false;
  const [who, when, sig] = parts;
  if (who !== userId) return false;

  // The signature proves authenticity; the timestamp must also be checked,
  // otherwise old states remain valid forever.
  const issuedAt = Number(when);
  if (!Number.isInteger(issuedAt)) return false;
  const age = Date.now() - issuedAt;
  if (age > STATE_TTL_MS || age < -STATE_FUTURE_SKEW_MS) return false;

  const expected = sign([`${who}.${when}`]);
  const a = Buffer.from(sig ?? "");
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Build a fresh OAuth2 client per call — never share credentials across calls. */
function buildOAuth2(tokens?: GoogleTokens) {
  const client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
  if (tokens) {
    client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });
  }
  return client;
}

export function generateGoogleAuthUrl(state: string): string {
  return buildOAuth2().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokens> {
  const { tokens } = await buildOAuth2().getToken(code);
  return {
    access_token: tokens.access_token ?? "",
    refresh_token: tokens.refresh_token ?? undefined,
    scope: tokens.scope ?? undefined,
    token_type: tokens.token_type ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined,
  };
}

/**
 * Create a Google Calendar event with a Meet conference on the doctor's calendar
 * from the doctor's OAuth tokens. Returns the hangout link + event id.
 */
export async function createMeetEvent(input: {
  tokens: GoogleTokens;
  appointmentId: string;
  doctorName: string;
  slotDate: string;
  slotTime: string;
}): Promise<{ meetLink: string; googleEventId: string }> {
  const calendar: calendar_v3.Calendar = google.calendar({
    version: "v3",
    auth: buildOAuth2(input.tokens),
  });

  // Parse "yyyy-MM-dd hh:mm aa" (e.g. "2026-08-10 10:00 AM") into a Date using a
  // fixed reference so the server timezone never affects the parse.
  const startDate = parse(
    `${input.slotDate} ${input.slotTime}`,
    "yyyy-MM-dd hh:mm aa",
    new Date(0),
  );
  if (Number.isNaN(startDate.getTime())) {
    throw new Error(`Invalid slot: ${input.slotDate} ${input.slotTime}`);
  }
  const endDate = addMinutes(startDate, 30);

  const toIso = (date: Date) =>
    `${format(date, "yyyy-MM-dd'T'HH:mm:ss")}+05:30`;

  const res = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Appointment with ${input.doctorName}`,
      description: `HealthBridge appointment ${input.appointmentId}`,
      start: {
        dateTime: toIso(startDate),
        timeZone: env.CALENDAR_TIMEZONE,
      },
      end: {
        dateTime: toIso(endDate),
        timeZone: env.CALENDAR_TIMEZONE,
      },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  return {
    meetLink: res.data.hangoutLink ?? "",
    googleEventId: res.data.id ?? "",
  };
}

export async function deleteMeetEvent(input: {
  tokens: GoogleTokens;
  googleEventId: string;
}): Promise<void> {
  const calendar: calendar_v3.Calendar = google.calendar({
    version: "v3",
    auth: buildOAuth2(input.tokens),
  });
  await calendar.events.delete({
    calendarId: "primary",
    eventId: input.googleEventId,
  });
}

/**
 * Best-effort removal of a Meet event for an appointment via the doctor's
 * linked Google account. Never throws — cancellation must not fail on Google.
 */
export async function tryDeleteMeetEvent(input: {
  tokens?: GoogleTokens | null;
  googleEventId?: string | null;
}): Promise<void> {
  if (!input.googleEventId || !input.tokens?.access_token) return;
  try {
    await deleteMeetEvent({
      tokens: input.tokens,
      googleEventId: input.googleEventId,
    });
  } catch (error) {
    console.error("Google Meet deletion failed:", error);
  }
}
