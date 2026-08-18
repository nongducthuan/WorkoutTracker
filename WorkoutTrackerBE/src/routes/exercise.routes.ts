import { Router } from "express";
import { ExerciseController } from "../controllers/exercise.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
const exerciseController = new ExerciseController();

router.get("/", requireAuth, exerciseController.getExercises);
router.get("/categories", requireAuth, exerciseController.getCategories);
router.get("/:id", requireAuth, exerciseController.getExerciseById);

export default router;
