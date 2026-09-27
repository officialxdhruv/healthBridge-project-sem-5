import { BcryptPasswordHasher, SessionAuthProvider } from "@healthbridge/auth";
import { MongoDbAdapter } from "@healthbridge/db";
import { createImageStore } from "@healthbridge/image";
import { env } from "./env";

export function composeDb() {
  return new MongoDbAdapter({
    uri: env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME,
  });
}

export function composeAuth(db: MongoDbAdapter) {
  return new SessionAuthProvider(db.sessions, {
    ttlMs: env.SESSION_TTL_MINUTES * 60 * 1000,
  });
}

export function composeHasher() {
  return new BcryptPasswordHasher();
}

export function composeImageStore() {
  switch (env.IMAGE_PROVIDER) {
    case "imagekit":
      return createImageStore({
        provider: "imagekit",
        privateKey: env.IMAGEKIT_PRIVATE_KEY,
        folder: "healthbridge",
      });
    default:
      throw new Error(`Unknown IMAGE_PROVIDER: ${env.IMAGE_PROVIDER}`);
  }
}

/** Composition root — centralise wiring so consumer code never instantiates internals. */
export function compose() {
  const db = composeDb();
  const auth = composeAuth(db);
  const hasher = composeHasher();
  const image = composeImageStore();
  return { db, auth, hasher, image };
}
