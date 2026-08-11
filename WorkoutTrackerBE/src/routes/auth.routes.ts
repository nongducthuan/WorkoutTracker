import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
  ForgotPasswordSchema,
  VerifyOtpSchema,
  ResetPasswordSchema,
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
router.post("/forgot-password", validate(ForgotPasswordSchema), authController.forgotPassword);
router.post("/verify-otp", validate(VerifyOtpSchema), authController.verifyOtp);
router.put("/reset-password", validate(ResetPasswordSchema), authController.resetPassword);

export default router;