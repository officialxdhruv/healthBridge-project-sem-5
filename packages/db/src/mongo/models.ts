import mongoose, {
  type HydratedDocument,
  type InferSchemaType,
  type Model,
  model,
} from "mongoose";

function modelFor<T>(
  name: string,
  existing: unknown,
  schema: mongoose.Schema<T>,
): Model<T> {
  return (existing as Model<T> | undefined) ?? model<T>(name, schema);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    image: { type: String, default: "" },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Not Selected"],
      default: "Not Selected",
    },
    dob: { type: String, default: null },
    phone: { type: String, default: null },
  },
  { timestamps: true, collection: "users" },
);

const sessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true },
    role: { type: String, enum: ["user", "doctor", "admin"], required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true, collection: "sessions" },
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    image: { type: String, default: "" },
    speciality: { type: String, default: "" },
    degree: { type: String, default: "" },
    experience: { type: String, default: "" },
    about: { type: String, default: "" },
    available: { type: Boolean, default: true },
    fees: { type: Number, default: 0 },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
    },
    slotsBooked: {
      type: Map,
      of: [String],
      default: {},
    },
    googleTokens: {
      type: {
        access_token: { type: String, default: "" },
        refresh_token: { type: String, default: "" },
        scope: { type: String, default: "" },
        token_type: { type: String, default: "" },
        expiry_date: { type: Number, default: 0 },
      },
      default: null,
      select: false,
    },
    isGoogleLinked: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "doctors" },
);

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    docId: { type: String, required: true, index: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      image: { type: String, default: "" },
      dob: { type: String, default: "" },
    },
    docData: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      speciality: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    amount: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    meetLink: { type: String, default: "" },
    googleEventId: { type: String, default: "" },
  },
  { timestamps: true, collection: "appointments" },
);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;
export type SessionDoc = HydratedDocument<
  InferSchemaType<typeof sessionSchema>
>;
export type DoctorDoc = HydratedDocument<InferSchemaType<typeof doctorSchema>>;
export type AppointmentDoc = HydratedDocument<
  InferSchemaType<typeof appointmentSchema>
>;

export const userModel = modelFor("user", mongoose.models.User, userSchema);
export const sessionModel = modelFor(
  "session",
  mongoose.models.Session,
  sessionSchema,
);
export const doctorModel = modelFor(
  "doctor",
  mongoose.models.Doctor,
  doctorSchema,
);
export const appointmentModel = modelFor(
  "appointment",
  mongoose.models.Appointment,
  appointmentSchema,
);
