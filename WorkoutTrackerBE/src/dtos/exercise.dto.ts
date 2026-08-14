import { z } from "zod";

export const GetExercisesQuerySchema = z.object({
  search: z.string().optional(),
  /**
   * Matches `exercises.category` exactly. The catalogue screen (05) filters by
   * muscle group as well as by name, and doing it here is what lets the client
   * stop downloading the whole catalogue to filter it on the device.
   */
  category: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() ? val.trim() : undefined)),
  /**
   * Upper bound, not an exact match: "Intermediate" returns beginner *and*
   * intermediate movements. The onboarding level (01e) feeds this, and someone
   * who calls themselves intermediate has not stopped doing beginner lifts.
   */
  maxDifficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 10) : 10)),
});

export type GetExercisesQueryDto = z.infer<typeof GetExercisesQuerySchema>;
