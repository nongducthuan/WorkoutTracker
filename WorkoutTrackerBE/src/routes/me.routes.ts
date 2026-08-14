import { Router } from "express";
import { UserSettingsController } from "../controllers/userSettings.controller";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UpdateUserSettingsSchema } from "../dtos/userSettings.dto";

const router = Router();
const settingsController = new UserSettingsController();
const authController = new AuthController();

router.get("/", requireAuth, authController.me);
router.get("/settings", requireAuth, settingsController.get);
router.put(
  "/settings",
  requireAuth,
  validate(UpdateUserSettingsSchema),
  settingsController.update
);

export default router;
