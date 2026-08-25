import { compose } from "@/compose";
import { env } from "@/env";
import { createServer } from "@/server";

const { db, auth, hasher, image } = compose();

const bootstrap = async () => {
  await db.connect();
  console.log("Database connected");

  // Housekeeping: purge expired sessions (harmless garbage, but keep it tidy).
  await db.sessions.deleteExpired();
  setInterval(() => {
    db.sessions.deleteExpired().catch((err: unknown) => {
      console.error("deleteExpired failed:", err);
    });
  }, 15 * 60_000).unref();

  const server = createServer({
    users: db.users,
    doctors: db.doctors,
    appointments: db.appointments,
    auth,
    hasher,
    image,
  });

  server.listen(env.PORT, () => {
    console.log(`API running on : ${env.PORT}`);
  });
};

bootstrap().catch((err) => {
  console.error("Failed to start server : ", err);
  process.exit(1);
});
