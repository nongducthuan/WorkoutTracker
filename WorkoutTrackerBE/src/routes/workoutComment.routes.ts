import { Router } from "express";
import { WorkoutCommentController } from "../controllers/workoutComment.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  CreateWorkoutCommentSchema,
  UpdateWorkoutCommentSchema,
} from "../dtos/workoutComment.dto";

const router = Router();
const controller = new WorkoutCommentController();

router.get("/:workoutId", requireAuth, controller.getByWorkoutId);
router.post("/", requireAuth, validate(CreateWorkoutCommentSchema), controller.create);
router.put("/:id", requireAuth, validate(UpdateWorkoutCommentSchema), controller.update);
router.delete("/:id", requireAuth, controller.delete);

export default router;
