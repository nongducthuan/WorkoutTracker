import { Router } from "express";
import { WorkoutPlanController } from "../controllers/workoutPlan.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { CreateWorkoutPlanSchema, UpdateWorkoutPlanSchema } from "../dtos/workoutPlan.dto";

const router = Router();
const controller = new WorkoutPlanController();

router.get("/", requireAuth, controller.getAll);
router.get("/:id", requireAuth, controller.getById);
router.post("/", requireAuth, validate(CreateWorkoutPlanSchema), controller.create);
router.put("/:id", requireAuth, validate(UpdateWorkoutPlanSchema), controller.update);
router.delete("/:id", requireAuth, controller.delete);

export default router;
