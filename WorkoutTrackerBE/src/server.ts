import app from "./app";
import { config } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { getMailer } from "./services/mail.service";

// Fail at boot rather than on the first password reset if SMTP is missing in
// production.
getMailer();

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, "Server started");
});

// Open the pool up front. Otherwise the first request — often the readiness
// probe — pays the connection cost and can exceed the healthcheck timeout.
prisma
  .$connect()
  .then(() => logger.info("Database connection established"))
  .catch((err) => logger.error({ err }, "Initial database connection failed"));

let shuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutting down");

  // Stop accepting new connections, let in-flight requests finish, then release
  // the database pool so MySQL does not hold onto dead connections.
  const timeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out after 10s — forcing exit");
    process.exit(1);
  }, 10_000);
  timeout.unref();

  server.close(async (err) => {
    if (err) logger.error({ err }, "Error while closing the HTTP server");
    try {
      await prisma.$disconnect();
      logger.info("Prisma disconnected");
    } catch (disconnectError) {
      logger.error({ err: disconnectError }, "Error while disconnecting Prisma");
    }
    process.exit(err ? 1 : 0);
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception — exiting");
  void shutdown("uncaughtException");
});
