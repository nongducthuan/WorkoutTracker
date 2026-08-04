import { Router } from "express";
import { ScheduleWorkoutController } from "../controllers/scheduleWorkout.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  CreateScheduleWorkoutSchema,
  UpdateScheduleWorkoutSchema,
} from "../dtos/scheduleWorkout.dto";

const router = Router();
const controller = new ScheduleWorkoutController();

router.get("/", requireAuth, controller.getAll);
router.get("/workout/:workoutId", requireAuth, controller.getByWorkoutId);
router.post("/", requireAuth, validate(CreateScheduleWorkoutSchema), controller.create);
router.put("/:id", requireAuth, validate(UpdateScheduleWorkoutSchema), controller.update);
router.put("/:id/complete", requireAuth, controller.complete);
router.delete("/:id", requireAuth, controller.delete);

export default router;
