import express, { Request, Response } from "express";
import cors from "cors";

import authRouter from "./routes/auth.routes";
import exerciseRouter from "./routes/exercise.routes";
import workoutPlanRouter from "./routes/workoutPlan.routes";
import workoutExerciseRouter from "./routes/workoutExercise.routes";
import scheduleWorkoutRouter from "./routes/scheduleWorkout.routes";
import workoutCommentRouter from "./routes/workoutComment.routes";
import reportRouter from "./routes/report.routes";

import { errorHandler } from "./middlewares/errorHandler.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health/live", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/exercises", exerciseRouter);
app.use("/workouts", workoutPlanRouter);
app.use("/workout-exercises", workoutExerciseRouter);
app.use("/workout-schedules", scheduleWorkoutRouter);
app.use("/workout-comments", workoutCommentRouter);
app.use("/reports", reportRouter);

app.use(errorHandler);

export default app;
