import type {
  Appointment,
  Doctor,
  GoogleTokens,
  Session,
  SlotsBooked,
  User,
} from "@healthbridge/types";
import { DuplicateEmailError } from "../errors";
import type {
  AppointmentRepo,
  CreateAppointmentInput,
  CreateDoctorInput,
  CreateSessionInput,
  CreateUserInput,
  DoctorRepo,
  SessionRepo,
  StoredDoctor,
  StoredUser,
  UpdateAppointmentInput,
  UpdateDoctorInput,
  UpdateUserInput,
  UserRepo,
} from "../repos";
import {
  appointmentModel,
  doctorModel,
  sessionModel,
  userModel,
} from "./models";

type Id = unknown;

/** Emails are stored and matched case-insensitively. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Mongo unique-index violation → domain error. */
function assertNotDuplicate(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    throw new DuplicateEmailError();
  }
  throw error;
}

export class MongoUserRepo implements UserRepo {
  async create(input: CreateUserInput): Promise<User> {
    try {
      const doc = await userModel.create({
        ...input,
        email: normalizeEmail(input.email),
      });
      return toUser(doc);
    } catch (error) {
      assertNotDuplicate(error);
    }
  }

  async findById(id: string): Promise<User | null> {
    const doc = await userModel.findById(id);
    return doc ? toUser(doc) : null;
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    // passwordHash is select:false — explicitly request it for auth lookups
    const doc = await userModel
      .findOne({ email: normalizeEmail(email) })
      .select("+passwordHash");
    return doc ? toStoredUser(doc) : null;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const doc = await userModel.findByIdAndUpdate(id, input, { new: true });
    return doc ? toUser(doc) : null;
  }

  async count(): Promise<number> {
    return userModel.countDocuments();
  }
}

export class MongoSessionRepo implements SessionRepo {
  async create(input: CreateSessionInput): Promise<Session> {
    const doc = await sessionModel.create(input);
    return toSession(doc);
  }

  async findById(id: string): Promise<Session | null> {
    const doc = await sessionModel.findById(id);
    return doc ? toSession(doc) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const doc = await sessionModel.findOne({ tokenHash });
    return doc ? toSession(doc) : null;
  }

  async touch(id: string, expiresAt: Date): Promise<void> {
    await sessionModel.findByIdAndUpdate(id, { expiresAt });
  }

  async delete(id: string): Promise<void> {
    await sessionModel.findByIdAndDelete(id);
  }

  async deleteExpired(): Promise<number> {
    const result = await sessionModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount ?? 0;
  }
}

export class MongoDoctorRepo implements DoctorRepo {
  async create(input: CreateDoctorInput): Promise<Doctor> {
    try {
      const doc = await doctorModel.create({
        ...input,
        email: normalizeEmail(input.email),
      });
      return toDoctor(doc);
    } catch (error) {
      assertNotDuplicate(error);
    }
  }

  async findById(id: string): Promise<Doctor | null> {
    const doc = await doctorModel.findById(id);
    return doc ? toDoctor(doc) : null;
  }

  async findByEmail(email: string): Promise<StoredDoctor | null> {
    // passwordHash is select:false — explicitly request it for auth lookups
    const doc = await doctorModel
      .findOne({ email: normalizeEmail(email) })
      .select("+passwordHash");
    return doc ? toStoredDoctor(doc) : null;
  }

  async findAll(): Promise<Doctor[]> {
    const docs = await doctorModel.find({});
    return docs.map(toDoctor);
  }

  async update(id: string, input: UpdateDoctorInput): Promise<Doctor | null> {
    const doc = await doctorModel.findByIdAndUpdate(id, input, { new: true });
    return doc ? toDoctor(doc) : null;
  }

  async setAvailability(
    id: string,
    available: boolean,
  ): Promise<Doctor | null> {
    const doc = await doctorModel.findByIdAndUpdate(
      id,
      { available },
      { new: true },
    );
    return doc ? toDoctor(doc) : null;
  }

  async bookSlot(
    id: string,
    slotDate: string,
    slotTime: string,
  ): Promise<boolean> {
    const key = `slotsBooked.${slotDate}`;
    // Guarded by $nin so two concurrent bookings can't double-book the slot.
    const result = await doctorModel.updateOne(
      { _id: id, [key]: { $nin: [slotTime] } },
      { $push: { [key]: slotTime } },
    );
    return result.modifiedCount === 1;
  }

  async freeSlot(
    id: string,
    slotDate: string,
    slotTime: string,
  ): Promise<void> {
    const key = `slotsBooked.${slotDate}`;
    await doctorModel.updateOne({ _id: id }, { $pull: { [key]: slotTime } });
  }

  async count(): Promise<number> {
    return doctorModel.countDocuments();
  }

  async getGoogleAuth(
    id: string,
  ): Promise<{ googleTokens: GoogleTokens } | null> {
    const doc = await doctorModel.findById(id).select("+googleTokens");
    if (!doc) return null;
    const raw = doc.googleTokens;
    if (!raw || typeof raw.access_token !== "string") return null;
    const googleTokens: GoogleTokens = {
      access_token: raw.access_token,
      refresh_token: raw.refresh_token || undefined,
      scope: raw.scope || undefined,
      token_type: raw.token_type || undefined,
      expiry_date: raw.expiry_date ?? undefined,
    };
    return { googleTokens };
  }

  async saveGoogleAuth(
    id: string,
    googleTokens: GoogleTokens,
    isGoogleLinked: boolean,
  ): Promise<Doctor | null> {
    const doc = await doctorModel.findByIdAndUpdate(
      id,
      { googleTokens, isGoogleLinked },
      { new: true },
    );
    return doc ? toDoctor(doc) : null;
  }
}

export class MongoAppointmentRepo implements AppointmentRepo {
  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const doc = await appointmentModel.create(input);
    return toAppointment(doc);
  }

  async findById(id: string): Promise<Appointment | null> {
    const doc = await appointmentModel.findById(id);
    return doc ? toAppointment(doc) : null;
  }

  async findByUserId(userId: string): Promise<Appointment[]> {
    const docs = await appointmentModel.find({ userId });
    return docs.map(toAppointment);
  }

  async findByDoctorId(docId: string): Promise<Appointment[]> {
    const docs = await appointmentModel.find({ docId });
    return docs.map(toAppointment);
  }

  async findAll(): Promise<Appointment[]> {
    const docs = await appointmentModel.find({});
    return docs.map(toAppointment);
  }

  async update(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment | null> {
    const doc = await appointmentModel.findByIdAndUpdate(id, input, {
      new: true,
    });
    return doc ? toAppointment(doc) : null;
  }

  async count(): Promise<number> {
    return appointmentModel.countDocuments();
  }
}

function toUser(doc: {
  _id: Id;
  name: string;
  email: string;
  image?: string;
}): User {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    image: doc.image,
  };
}

function toStoredUser(doc: {
  _id: Id;
  name: string;
  email: string;
  image?: string;
  passwordHash: string;
}): StoredUser {
  return {
    ...toUser(doc),
    passwordHash: doc.passwordHash,
  };
}

function toSession(doc: {
  _id: Id;
  tokenHash: string;
  userId: Id;
  role: Session["role"];
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}): Session {
  return {
    id: String(doc._id),
    tokenHash: doc.tokenHash,
    userId: String(doc.userId),
    role: doc.role,
    expiresAt: doc.expiresAt.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

function toDoctor(doc: {
  _id: Id;
  name: string;
  email: string;
  image?: string;
  speciality?: string;
  degree?: string;
  experience?: string;
  about?: string;
  available?: boolean;
  fees?: number;
  address?: Record<string, string>;
  slotsBooked?: Map<string, string[]> | SlotsBooked;
  isGoogleLinked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}): Doctor {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    image: doc.image ?? "",
    speciality: doc.speciality ?? "",
    degree: doc.degree ?? "",
    experience: doc.experience ?? "",
    about: doc.about ?? "",
    available: doc.available ?? true,
    fees: doc.fees ?? 0,
    address: {
      line1: doc.address?.line1 ?? "",
      line2: doc.address?.line2 ?? "",
      city: doc.address?.city ?? "",
      state: doc.address?.state ?? "",
    },
    slotsBooked: toSlotsBooked(doc.slotsBooked),
    isGoogleLinked: doc.isGoogleLinked ?? false,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

function toStoredDoctor(doc: {
  _id: Id;
  name: string;
  email: string;
  passwordHash: string;
}): StoredDoctor {
  return {
    ...toDoctor(doc),
    passwordHash: doc.passwordHash,
  };
}

function toSlotsBooked(
  value: Map<string, string[]> | SlotsBooked | undefined,
): SlotsBooked {
  if (!value) return {};
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }
  return value;
}

function toAppointment(doc: {
  _id: Id;
  userId: Id;
  docId: Id;
  slotDate: string;
  slotTime: string;
  userData: {
    name: string;
    email: string;
    phone?: string;
    image?: string;
    dob?: string;
  };
  docData: {
    name: string;
    email: string;
    speciality: string;
    image: string;
  };
  amount: number;
  cancelled: boolean;
  payment: boolean;
  isCompleted: boolean;
  meetLink?: string;
  googleEventId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}): Appointment {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    docId: String(doc.docId),
    slotDate: doc.slotDate,
    slotTime: doc.slotTime,
    userData: doc.userData,
    docData: doc.docData,
    amount: doc.amount,
    cancelled: doc.cancelled,
    payment: doc.payment,
    isCompleted: doc.isCompleted,
    meetLink: doc.meetLink ?? "",
    googleEventId: doc.googleEventId ?? "",
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}
