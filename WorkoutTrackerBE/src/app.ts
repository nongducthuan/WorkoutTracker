import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import authRouter from "./routes/auth.routes";
import meRouter from "./routes/me.routes";
import exerciseRouter from "./routes/exercise.routes";
import workoutPlanRouter from "./routes/workoutPlan.routes";
import workoutExerciseRouter from "./routes/workoutExercise.routes";
import scheduleWorkoutRouter from "./routes/scheduleWorkout.routes";
import workoutCommentRouter from "./routes/workoutComment.routes";
import workoutSessionRouter from "./routes/workoutSession.routes";
import reportRouter from "./routes/report.routes";

import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.middleware";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { globalLimiter } from "./middlewares/rateLimit.middleware";
import { config } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { openApiDocument } from "./docs/openapi";

const app = express();

// Behind a reverse proxy the client IP arrives in X-Forwarded-For; without this
// every request would rate limit against the proxy's single address.
app.set("trust proxy", 1);

app.use(helmet());

if (config.corsOrigins.length > 0) {
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    })
  );
} else {
  if (config.isProduction) {
    throw new Error(
      "[config] CORS_ORIGINS must list the allowed origins in production. " +
        "An open CORS policy lets any site call this API with a user's token."
    );
  }
  logger.warn("CORS_ORIGINS is empty — allowing all origins (development only)");
  app.use(cors());
}

// A cap on the body size: without it a single request can pin memory and CPU.
app.use(express.json({ limit: config.jsonBodyLimit }));
app.use(express.urlencoded({ extended: false, limit: config.jsonBodyLimit }));

app.use(requestLogger);
app.use(globalLimiter);

/** Liveness: the process is up. Deliberately does not touch the database. */
app.get("/health/live", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/** Readiness: the process can actually serve traffic, database included. */
app.get("/health/ready", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", database: "up" });
  } catch (error) {
    logger.error({ err: error }, "Readiness check failed");
    res.status(503).json({ status: "unavailable", database: "down" });
  }
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/openapi.json", (_req: Request, res: Response) => {
  res.status(200).json(openApiDocument);
});

app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/exercises", exerciseRouter);
app.use("/workouts", workoutPlanRouter);
app.use("/workout-exercises", workoutExerciseRouter);
app.use("/workout-schedules", scheduleWorkoutRouter);
app.use("/workout-comments", workoutCommentRouter);
app.use("/workout-sessions", workoutSessionRouter);
app.use("/reports", reportRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
