import { Router } from "express";
import { ExerciseController } from "../controllers/exercise.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
const exerciseController = new ExerciseController();

router.get("/", requireAuth, exerciseController.getExercises);

export default router;
