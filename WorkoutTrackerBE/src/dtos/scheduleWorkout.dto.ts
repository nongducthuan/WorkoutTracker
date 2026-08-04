import { z } from "zod";

export const CreateScheduleWorkoutSchema = z.object({
  scheduledDate: z.string().datetime({ message: "InvalidInputs" }),
  workoutId: z.string().uuid("InvalidInputs"),
});

export const UpdateScheduleWorkoutSchema = z.object({
  scheduledDate: z.string().datetime({ message: "InvalidInputs" }),
  workoutId: z.string().uuid("InvalidInputs").optional(),
});

export type CreateScheduleWorkoutDto = z.infer<typeof CreateScheduleWorkoutSchema>;
export type UpdateScheduleWorkoutDto = z.infer<typeof UpdateScheduleWorkoutSchema>;
