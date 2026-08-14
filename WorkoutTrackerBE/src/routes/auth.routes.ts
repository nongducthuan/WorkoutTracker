import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { authLimiter, otpRequestLimiter } from "../middlewares/rateLimit.middleware";
import {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
  ForgotPasswordSchema,
  VerifyOtpSchema,
  ResetPasswordSchema,
  RefreshTokenSchema,
} from "../dtos/auth.dto";

const router = Router();
const authController = new AuthController();

router.post("/login", authLimiter, validate(LoginSchema), authController.login);
router.post("/register", authLimiter, validate(RegisterSchema), authController.register);
router.post("/refresh", validate(RefreshTokenSchema), authController.refresh);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

router.put(
  "/change-password",
  requireAuth,
  validate(ChangePasswordSchema),
  authController.changePassword
);
router.put("/profile", requireAuth, validate(UpdateProfileSchema), authController.updateProfile);

router.post(
  "/forgot-password",
  otpRequestLimiter,
  validate(ForgotPasswordSchema),
  authController.forgotPassword
);
router.post("/verify-otp", authLimiter, validate(VerifyOtpSchema), authController.verifyOtp);
router.put(
  "/reset-password",
  authLimiter,
  validate(ResetPasswordSchema),
  authController.resetPassword
);

export default router;
