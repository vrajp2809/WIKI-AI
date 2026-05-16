import { connectDB, disconnectDB } from "./database";

async function runMigrations() {
  await connectDB();
  console.log("✅ MongoDB uses Mongoose schemas; no SQL migrations to run.");
  await disconnectDB();
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
