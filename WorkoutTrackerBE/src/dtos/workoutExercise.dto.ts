import { z } from "zod";

export const CreateWorkoutExerciseSchema = z.object({
  workoutId: z.string().uuid("InvalidInputs"),
  exerciseId: z.number().int("InvalidInputs"),
  sets: z.number().int("InvalidSets").refine((val) => val > 0, { message: "InvalidSets" }),
  repetitions: z.number().int("InvalidRepetitions").refine((val) => val > 0, { message: "InvalidRepetitions" }),
  weight: z.number().refine((val) => val >= 0, { message: "InvalidWeight" }),
});

export const UpdateWorkoutExerciseSchema = z.object({
  exerciseId: z.number().int("InvalidInputs").optional(),
  sets: z.number().int("InvalidSets").refine((val) => val > 0, { message: "InvalidSets" }).optional(),
  repetitions: z.number().int("InvalidRepetitions").refine((val) => val > 0, { message: "InvalidRepetitions" }).optional(),
  weight: z.number().refine((val) => val >= 0, { message: "InvalidWeight" }).optional(),
});

export type CreateWorkoutExerciseDto = z.infer<typeof CreateWorkoutExerciseSchema>;
export type UpdateWorkoutExerciseDto = z.infer<typeof UpdateWorkoutExerciseSchema>;
