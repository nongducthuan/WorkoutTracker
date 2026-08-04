import { z } from "zod";

export const CreateWorkoutCommentSchema = z.object({
  workoutId: z.string().uuid("InvalidInputs"),
  comment: z
    .string()
    .min(1, "CommentsCannotBeEmpty")
    .refine((val) => val.trim().length > 0, { message: "CommentsCannotBeEmpty" }),
});

export const UpdateWorkoutCommentSchema = z.object({
  comment: z
    .string()
    .min(1, "CommentsCannotBeEmpty")
    .refine((val) => val.trim().length > 0, { message: "CommentsCannotBeEmpty" }),
});

export type CreateWorkoutCommentDto = z.infer<typeof CreateWorkoutCommentSchema>;
export type UpdateWorkoutCommentDto = z.infer<typeof UpdateWorkoutCommentSchema>;
