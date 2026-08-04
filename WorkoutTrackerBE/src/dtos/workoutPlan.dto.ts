import { z } from "zod";

export const CreateWorkoutPlanSchema = z.object({
  name: z.string().min(1, "InvalidInputs"),
  description: z.string().min(1, "InvalidInputs"),
});

export const UpdateWorkoutPlanSchema = z.object({
  name: z.string().min(1, "InvalidInputs").optional(),
  description: z.string().min(1, "InvalidInputs").optional(),
});

export type CreateWorkoutPlanDto = z.infer<typeof CreateWorkoutPlanSchema>;
export type UpdateWorkoutPlanDto = z.infer<typeof UpdateWorkoutPlanSchema>;
