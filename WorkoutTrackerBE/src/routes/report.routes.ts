import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ReportController();

router.get("/", requireAuth, controller.getReport);
router.get("/personal-records", requireAuth, controller.getPersonalRecords);
router.get("/muscle-load", requireAuth, controller.getMuscleLoad);
router.get("/exercise-history/:exerciseId", requireAuth, controller.getExerciseHistory);

export default router;
