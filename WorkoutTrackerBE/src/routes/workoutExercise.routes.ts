import { Router } from "express";
import { WorkoutExerciseController } from "../controllers/workoutExercise.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  CreateWorkoutExerciseSchema,
  UpdateWorkoutExerciseSchema,
} from "../dtos/workoutExercise.dto";

const router = Router();
const controller = new WorkoutExerciseController();

router.get("/:workoutId", requireAuth, controller.getByWorkoutId);
router.post("/", requireAuth, validate(CreateWorkoutExerciseSchema), controller.create);
router.put("/:id", requireAuth, validate(UpdateWorkoutExerciseSchema), controller.update);
router.delete("/:id", requireAuth, controller.delete);

export default router;
