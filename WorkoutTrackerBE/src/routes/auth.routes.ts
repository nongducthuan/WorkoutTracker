import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
} from "../dtos/auth.dto";

const router = Router();
const authController = new AuthController();

router.post("/login", validate(LoginSchema), authController.login);
router.post("/register", validate(RegisterSchema), authController.register);
router.put(
  "/change-password",
  requireAuth,
  validate(ChangePasswordSchema),
  authController.changePassword
);
router.put(
  "/profile",
  requireAuth,
  validate(UpdateProfileSchema),
  authController.updateProfile
);

export default router;
