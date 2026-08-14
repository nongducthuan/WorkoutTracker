import { z } from "zod";

const MAX_SETS_PER_SESSION = 300;

export const SetInputSchema = z.object({
  exerciseId: z.number().int("InvalidInputs"),
  setIndex: z.number().int("InvalidInputs").min(1, "InvalidInputs"),
  reps: z.number().int("InvalidRepetitions").min(0, "InvalidRepetitions").max(1000, "InvalidRepetitions"),
  weight: z.number().min(0, "InvalidWeight").max(1000, "InvalidWeight"),
  completedAt: z.string().datetime({ message: "InvalidInputs" }).optional(),
});

/**
 * Starting a session and logging a finished one share this shape: omit `sets` to
 * open a live session, send them to record a workout in a single call (which is
 * what the app does when it syncs a session captured offline).
 */
export const CreateSessionSchema = z.object({
  workoutId: z.string().uuid("InvalidInputs"),
  scheduleId: z.string().uuid("InvalidInputs").optional(),
  startedAt: z.string().datetime({ message: "InvalidInputs" }).optional(),
  finishedAt: z.string().datetime({ message: "InvalidInputs" }).optional(),
  durationSec: z.number().int("InvalidInputs").min(0, "InvalidInputs").max(86400, "InvalidInputs").optional(),
  note: z.string().max(2000, "InvalidInputs").optional(),
  sets: z.array(SetInputSchema).max(MAX_SETS_PER_SESSION, "InvalidInputs").optional(),
});

export const FinishSessionSchema = z.object({
  finishedAt: z.string().datetime({ message: "InvalidInputs" }).optional(),
  durationSec: z.number().int("InvalidInputs").min(0, "InvalidInputs").max(86400, "InvalidInputs").optional(),
  note: z.string().max(2000, "InvalidInputs").optional(),
  sets: z.array(SetInputSchema).max(MAX_SETS_PER_SESSION, "InvalidInputs").default([]),
});

const optionalDate = z
  .string()
  .datetime({ message: "InvalidInputs" })
  .optional()
  .transform((v) => (v ? new Date(v) : undefined));

const positiveIntFromQuery = (fallback: number, max: number) =>
  z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return fallback;
      const parsed = Number.parseInt(v, 10);
      if (!Number.isFinite(parsed) || parsed < 1) return fallback;
      return Math.min(parsed, max);
    });

export const GetSessionsQuerySchema = z.object({
  from: optionalDate,
  to: optionalDate,
  workoutId: z.string().uuid("InvalidInputs").optional(),
  finishedOnly: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  page: positiveIntFromQuery(1, 10_000),
  pageSize: positiveIntFromQuery(20, 100),
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type FinishSessionDto = z.infer<typeof FinishSessionSchema>;
export type GetSessionsQueryDto = z.infer<typeof GetSessionsQuerySchema>;
export type SetInputDto = z.infer<typeof SetInputSchema>;
