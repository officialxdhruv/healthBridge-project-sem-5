import type {
  AppointmentRepo,
  DoctorRepo,
  SessionRepo,
  UserRepo,
} from "./repos";

/** Composition surface the app depends on — the swappable "database" bundle. */
export interface Database {
  users: UserRepo;
  sessions: SessionRepo;
  doctors: DoctorRepo;
  appointments: AppointmentRepo;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  /** Drop every collection in the connected database (destructive). */
  dropDatabase(): Promise<void>;
}

export { DuplicateEmailError } from "./errors";
export {
  MongoAppointmentRepo,
  MongoDoctorRepo,
  MongoSessionRepo,
  MongoUserRepo,
} from "./mongo/adapter";
export { MongoDbAdapter } from "./mongo/index";
export type * from "./repos";
