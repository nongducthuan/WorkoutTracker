import { z } from "zod";

export const LoginSchema = z.object({
  userName: z.string().min(1, "InvalidInputs"),
  password: z.string().min(1, "InvalidInputs"),
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterSchema = z.object({
  fullName: z.string().min(1, "InvalidInputs"),
  userName: z.string().min(1, "InvalidInputs"),
  email: z
    .string()
    .min(1, "InvalidInputs")
    .refine((val) => emailRegex.test(val), { message: "InvalidEmailFormat" }),
  password: z.string().min(1, "InvalidInputs"),
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "InvalidInputs"),
  newPassword: z.string().min(1, "InvalidInputs"),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(1, "InvalidInputs"),
  email: z
    .string()
    .min(1, "InvalidInputs")
    .refine((val) => emailRegex.test(val), { message: "InvalidEmailFormat" }),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
