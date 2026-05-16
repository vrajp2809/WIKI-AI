import app from "./app";
import { connectDB } from "./config/database";
import { env } from "./config/environment";
import { connectRedis } from "./config/redis";
import { logger } from "./utils/logger";

const start = async () => {
  try {
    await connectDB();
    const redisConnected = await connectRedis();

    if (!redisConnected) {
      logger.warn("Continuing without Redis");
    }

    app.listen(env.PORT, () => {
      logger.info(`🚀 WikiAI API running on port ${env.PORT}`);
      logger.info(`   Mode: ${env.NODE_ENV}`);
      logger.info(
        `   Docs: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`,
      );
    });
  } catch (err) {
    logger.error("Failed to start server", { err });
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason });
});

start();
