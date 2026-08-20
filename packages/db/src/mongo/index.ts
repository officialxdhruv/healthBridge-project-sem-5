import mongoose from "mongoose";
import type { Database } from "../index";
import {
  MongoAppointmentRepo,
  MongoDoctorRepo,
  MongoSessionRepo,
  MongoUserRepo,
} from "./adapter";

export interface MongoConfig {
  uri: string;
  dbName: string;
}

/** Mongo/Mongoose implementation of the swappable Database bundle. */
export class MongoDbAdapter implements Database {
  readonly users = new MongoUserRepo();
  readonly sessions = new MongoSessionRepo();
  readonly doctors = new MongoDoctorRepo();
  readonly appointments = new MongoAppointmentRepo();

  constructor(private readonly config: MongoConfig) {}

  async connect(): Promise<void> {
    await mongoose.connect(this.config.uri, { dbName: this.config.dbName });
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  async dropDatabase(): Promise<void> {
    await mongoose.connection.dropDatabase();
  }
}
