import mongoose from "mongoose";
import { env } from "./environment";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("✅ MongoDB connected");
  } catch (err) {
    logger.error("❌ MongoDB connection failed", { err });
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("✅ MongoDB disconnected");
  } catch (err) {
    logger.error("❌ MongoDB disconnection failed", { err });
  }
};
