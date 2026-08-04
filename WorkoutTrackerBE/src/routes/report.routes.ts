import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ReportController();

router.get("/", requireAuth, controller.getReport);

export default router;
