import { Router } from "express";
import { WorkoutSessionController } from "../controllers/workoutSession.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { CreateSessionSchema, FinishSessionSchema } from "../dtos/workoutSession.dto";

const router = Router();
const controller = new WorkoutSessionController();

router.get("/", requireAuth, controller.getAll);
router.get("/:id", requireAuth, controller.getById);
router.post("/", requireAuth, validate(CreateSessionSchema), controller.create);
router.put("/:id/finish", requireAuth, validate(FinishSessionSchema), controller.finish);
router.delete("/:id", requireAuth, controller.delete);

export default router;
