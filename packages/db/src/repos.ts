import type {
  Address,
  Appointment,
  AppointmentDocData,
  AppointmentUserData,
  Doctor,
  Gender,
  GoogleTokens,
  Role,
  Session,
  SessionUser,
  User,
} from "@healthbridge/types";

/** A user as stored by the data layer (includes password hash, never exposed to routes). */
export interface StoredUser extends User {
  passwordHash: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  image?: string;
  address?: Address;
  gender?: Gender;
  dob?: string;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  image?: string;
  address?: Address;
  gender?: Gender;
  dob?: string;
  phone?: string;
}

/** Data-access contract for users. Adapters (e.g. Mongo) implement this. */
export interface UserRepo {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<StoredUser | null>;
  /** Returns null when no user exists with the given id. */
  update(id: string, input: UpdateUserInput): Promise<User | null>;
  count(): Promise<number>;
}

export interface CreateSessionInput {
  tokenHash: string;
  userId: string;
  role: Role;
  expiresAt: Date;
}

/** Data-access contract for sessions. Swappable independently of the auth strategy. */
export interface SessionRepo {
  create(input: CreateSessionInput): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  /** Extend the session lifetime (sliding expiry). */
  touch(id: string, expiresAt: Date): Promise<void>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<number>;
}

/** A doctor as stored by the data layer (includes password hash, never exposed to routes). */
export interface StoredDoctor extends Doctor {
  passwordHash: string;
}

export interface CreateDoctorInput {
  name: string;
  email: string;
  passwordHash: string;
  image?: string;
  speciality?: string;
  degree?: string;
  experience?: string;
  about?: string;
  available?: boolean;
  fees?: number;
  address?: Address;
}

export interface UpdateDoctorInput {
  name?: string;
  image?: string;
  speciality?: string;
  degree?: string;
  experience?: string;
  about?: string;
  fees?: number;
  address?: Address;
}

/** Data-access contract for doctors. Adapters (e.g. Mongo) implement this. */
export interface DoctorRepo {
  create(input: CreateDoctorInput): Promise<Doctor>;
  findById(id: string): Promise<Doctor | null>;
  /** Includes the password hash — for auth lookups only. */
  findByEmail(email: string): Promise<StoredDoctor | null>;
  /** Directory listing; public safe fields only (no email, no password). */
  findAll(): Promise<Doctor[]>;
  /** Returns null when no doctor exists with the given id. */
  update(id: string, input: UpdateDoctorInput): Promise<Doctor | null>;
  /** Returns null when no doctor exists with the given id. */
  setAvailability(id: string, available: boolean): Promise<Doctor | null>;
  count(): Promise<number>;
  /**
   * Atomically mark a slot as booked for a given date. Returns false when the
   * slot is already taken — race-safe, no read-modify-write.
   */
  bookSlot(id: string, slotDate: string, slotTime: string): Promise<boolean>;
  /** Atomically release a previously booked slot (e.g. on cancellation). */
  freeSlot(id: string, slotDate: string, slotTime: string): Promise<void>;
  /** Return the doctor's stored Google OAuth tokens (never exposed to routes). */
  getGoogleAuth(id: string): Promise<{ googleTokens: GoogleTokens } | null>;
  /** Persist Google OAuth tokens and the linked flag. Returns null when the doctor no longer exists. */
  saveGoogleAuth(
    id: string,
    googleTokens: GoogleTokens,
    isGoogleLinked: boolean,
  ): Promise<Doctor | null>;
}

/** Snapshot of the patient stored on the appointment at booking time. */
/** Snapshot of the doctor stored on the appointment at booking time. */
export type { AppointmentDocData, AppointmentUserData };

export interface CreateAppointmentInput {
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  userData: AppointmentUserData;
  docData: AppointmentDocData;
  amount: number;
}

export interface UpdateAppointmentInput {
  cancelled?: boolean;
  isCompleted?: boolean;
  payment?: boolean;
  meetLink?: string;
  googleEventId?: string;
}

/** Data-access contract for appointments. Adapters (e.g. Mongo) implement this. */
export interface AppointmentRepo {
  create(input: CreateAppointmentInput): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  findByUserId(userId: string): Promise<Appointment[]>;
  findByDoctorId(docId: string): Promise<Appointment[]>;
  findAll(): Promise<Appointment[]>;
  /** Returns null when no appointment exists with the given id. */
  update(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment | null>;
  count(): Promise<number>;
}

export type { SessionUser };
