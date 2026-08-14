import { z } from "zod";

/** Weekday numbers as JS getDay() reports them: 0 = Sunday … 6 = Saturday. */
const PreferredDaysSchema = z
  .array(z.number().int().min(0).max(6))
  .max(7, "InvalidInputs")
  .refine((days) => new Set(days).size === days.length, {
    message: "InvalidInputs",
  });

export const UpdateUserSettingsSchema = z
  .object({
    weeklyGoal: z.number().int("InvalidInputs").min(1, "InvalidInputs").max(14, "InvalidInputs").optional(),
    preferredDays: PreferredDaysSchema.optional(),
    weightUnit: z.enum(["kg", "lb"], { errorMap: () => ({ message: "InvalidInputs" }) }).optional(),
    restTimerSeconds: z.number().int("InvalidInputs").min(0, "InvalidInputs").max(600, "InvalidInputs").optional(),
    autoStartRestTimer: z.boolean().optional(),
    keepScreenOn: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
    vibrationEnabled: z.boolean().optional(),
    notificationsEnabled: z.boolean().optional(),
    language: z.enum(["vi", "en"], { errorMap: () => ({ message: "InvalidInputs" }) }).optional(),
    theme: z.enum(["light", "dark", "system"], { errorMap: () => ({ message: "InvalidInputs" }) }).optional(),
    autoSchedule: z.boolean().optional(),
    goal: z
      .enum(["muscle", "fat_loss", "endurance"], { errorMap: () => ({ message: "InvalidInputs" }) })
      .optional(),
    level: z
      .enum(["beginner", "intermediate", "advanced"], { errorMap: () => ({ message: "InvalidInputs" }) })
      .optional(),
    onboardingCompleted: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "InvalidInputs" });

export type UpdateUserSettingsDto = z.infer<typeof UpdateUserSettingsSchema>;
