import { z } from "zod";

export const CreateScheduleWorkoutSchema = z.object({
  scheduledDate: z.string().datetime({ message: "InvalidInputs" }),
  workoutId: z.string().uuid("InvalidInputs"),
  /** Omitted by older clients, which is why the column defaults to true. */
  remindEnabled: z.boolean().optional(),
});

export const UpdateScheduleWorkoutSchema = z.object({
  scheduledDate: z.string().datetime({ message: "InvalidInputs" }),
  workoutId: z.string().uuid("InvalidInputs").optional(),
  remindEnabled: z.boolean().optional(),
});

/**
 * Lets the calendar screen ask for one month instead of downloading every
 * schedule the account has ever had and filtering on the device.
 */
export const GetSchedulesQuerySchema = z.object({
  from: z
    .string()
    .datetime({ message: "InvalidInputs" })
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  to: z
    .string()
    .datetime({ message: "InvalidInputs" })
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  workoutId: z.string().uuid("InvalidInputs").optional(),
  isCompleted: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export type GetSchedulesQueryDto = z.infer<typeof GetSchedulesQuerySchema>;
export type CreateScheduleWorkoutDto = z.infer<typeof CreateScheduleWorkoutSchema>;
export type UpdateScheduleWorkoutDto = z.infer<typeof UpdateScheduleWorkoutSchema>;
