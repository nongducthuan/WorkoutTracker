import { z } from "zod";

export const MuscleLoadQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return 7;
      const parsed = Number.parseInt(v, 10);
      if (!Number.isFinite(parsed) || parsed < 1) return 7;
      // A year is already far more than any chart shows, and it caps the amount
      // of set data a single request can pull.
      return Math.min(parsed, 365);
    }),
});

export type MuscleLoadQueryDto = z.infer<typeof MuscleLoadQuerySchema>;

export const ExerciseHistoryQuerySchema = z.object({
  weeks: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return 8;
      const parsed = Number.parseInt(v, 10);
      if (!Number.isFinite(parsed) || parsed < 1) return 8;
      return Math.min(parsed, 52);
    }),
  sessionLimit: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return 12;
      const parsed = Number.parseInt(v, 10);
      if (!Number.isFinite(parsed) || parsed < 1) return 12;
      return Math.min(parsed, 100);
    }),
});

export type ExerciseHistoryQueryDto = z.infer<typeof ExerciseHistoryQuerySchema>;
