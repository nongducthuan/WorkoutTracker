import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailField = z
  .string()
  .min(1, "InvalidInputs")
  .max(254, "InvalidInputs")
  .refine((val) => emailRegex.test(val), { message: "InvalidEmailFormat" });

/**
 * Only enforced where a password is being *set*. Login stays `min(1)` so accounts
 * created before this rule can still sign in (and then change their password).
 */
const newPasswordField = z
  .string()
  .min(8, "PasswordTooShort")
  .max(128, "InvalidInputs");

const dateOnlyField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "InvalidInputs")
  .refine((val) => !Number.isNaN(Date.parse(val)), { message: "InvalidInputs" });

export const LoginSchema = z.object({
  userName: z.string().min(1, "InvalidInputs"),
  password: z.string().min(1, "InvalidInputs"),
});

export const RegisterSchema = z.object({
  fullName: z.string().min(1, "InvalidInputs").max(100, "InvalidInputs"),
  userName: z.string().min(1, "InvalidInputs").max(50, "InvalidInputs"),
  email: emailField,
  password: newPasswordField,
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "InvalidInputs"),
  newPassword: newPasswordField,
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(1, "InvalidInputs").max(100, "InvalidInputs"),
  email: emailField,
  avatarUrl: z.string().url("InvalidInputs").max(512, "InvalidInputs").nullable().optional(),
  weightKg: z.number().min(20, "InvalidInputs").max(400, "InvalidInputs").nullable().optional(),
  heightCm: z.number().int("InvalidInputs").min(80, "InvalidInputs").max(260, "InvalidInputs").nullable().optional(),
  birthday: dateOnlyField.nullable().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: emailField,
});

export const VerifyOtpSchema = z.object({
  email: emailField,
  otpCode: z.string().min(1, "InvalidInputs").max(10, "InvalidInputs"),
});

export const ResetPasswordSchema = z.object({
  resetToken: z.string().min(1, "InvalidInputs"),
  newPassword: newPasswordField,
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "InvalidInputs"),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
