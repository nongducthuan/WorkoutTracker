import { z } from "zod";

export const GetExercisesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 10) : 10)),
});

export type GetExercisesQueryDto = z.infer<typeof GetExercisesQuerySchema>;
