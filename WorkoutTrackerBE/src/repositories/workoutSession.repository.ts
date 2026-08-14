import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export interface SessionSetResponse {
  id: string;
  exerciseId: number;
  exerciseName: string;
  setIndex: number;
  reps: number;
  weight: number;
  completedAt: Date;
}

export interface WorkoutSessionResponse {
  id: string;
  workoutId: string;
  workoutName: string;
  scheduleId: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  durationSec: number;
  totalVolume: number;
  note: string | null;
  totalSets: number;
  exercisesCount: number;
  sets: SessionSetResponse[];
}

export interface SessionListResult {
  data: WorkoutSessionResponse[];
  total: number;
}

export interface SetInput {
  exerciseId: number;
  setIndex: number;
  reps: number;
  weight: number;
  completedAt?: Date;
}

/** One completed set, flattened with the metadata the report layer needs. */
export interface SetWithContext {
  exerciseId: number;
  exerciseName: string;
  category: string;
  setIndex: number;
  reps: number;
  weight: number;
  completedAt: Date;
  sessionId: string;
  /**
   * When the session began. `completedAt` marks the individual set, but history
   * is grouped by session, and a workout can straddle midnight.
   */
  sessionStartedAt: Date;
  workoutName: string;
}

const sessionInclude = {
  workout: { select: { name: true } },
  sets: {
    orderBy: [{ exerciseId: "asc" }, { setIndex: "asc" }] as const,
    include: { exercise: { select: { name: true } } },
  },
} satisfies Prisma.WorkoutSessionInclude;

type SessionRow = Prisma.WorkoutSessionGetPayload<{ include: typeof sessionInclude }>;

const toResponse = (row: SessionRow): WorkoutSessionResponse => ({
  id: row.id,
  workoutId: row.workoutId,
  workoutName: row.workout.name,
  scheduleId: row.scheduleId,
  startedAt: row.startedAt,
  finishedAt: row.finishedAt,
  durationSec: row.durationSec,
  totalVolume: row.totalVolume,
  note: row.note,
  totalSets: row.sets.length,
  exercisesCount: new Set(row.sets.map((s) => s.exerciseId)).size,
  sets: row.sets.map((s) => ({
    id: s.id,
    exerciseId: s.exerciseId,
    exerciseName: s.exercise.name,
    setIndex: s.setIndex,
    reps: s.reps,
    weight: s.weight,
    completedAt: s.completedAt,
  })),
});

export class WorkoutSessionRepository {
  async verifyWorkoutPlanOwnership(workoutId: string, userId: string): Promise<boolean> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: workoutId, userId },
      select: { id: true },
    });
    return !!plan;
  }

  async verifyScheduleOwnership(scheduleId: string, userId: string): Promise<boolean> {
    const schedule = await prisma.scheduleWorkout.findFirst({
      where: { id: scheduleId, workout: { userId } },
      select: { id: true },
    });
    return !!schedule;
  }

  async create(data: {
    userId: string;
    workoutId: string;
    scheduleId?: string | null;
    startedAt: Date;
  }): Promise<WorkoutSessionResponse> {
    const created = await prisma.workoutSession.create({
      data,
      include: sessionInclude,
    });
    return toResponse(created);
  }

  async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<WorkoutSessionResponse | null> {
    const row = await prisma.workoutSession.findFirst({
      where: { id, userId },
      include: sessionInclude,
    });
    return row ? toResponse(row) : null;
  }

  /** Lightweight existence/state check that avoids loading every set. */
  async findMetaByIdAndUserId(
    id: string,
    userId: string
  ): Promise<{ id: string; scheduleId: string | null; finishedAt: Date | null; startedAt: Date } | null> {
    return prisma.workoutSession.findFirst({
      where: { id, userId },
      select: { id: true, scheduleId: true, finishedAt: true, startedAt: true },
    });
  }

  async findMany(params: {
    userId: string;
    from?: Date;
    to?: Date;
    workoutId?: string;
    finishedOnly?: boolean;
    page: number;
    pageSize: number;
  }): Promise<SessionListResult> {
    const where: Prisma.WorkoutSessionWhereInput = {
      userId: params.userId,
      ...(params.workoutId ? { workoutId: params.workoutId } : {}),
      ...(params.finishedOnly ? { finishedAt: { not: null } } : {}),
      ...(params.from || params.to
        ? {
            startedAt: {
              ...(params.from ? { gte: params.from } : {}),
              ...(params.to ? { lte: params.to } : {}),
            },
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.workoutSession.findMany({
        where,
        include: sessionInclude,
        orderBy: { startedAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.workoutSession.count({ where }),
    ]);

    return { data: rows.map(toResponse), total };
  }

  /**
   * Replaces the session's sets and closes it out. Wrapped in a transaction so a
   * failure halfway cannot leave a session with a partial set list, and so the
   * linked schedule flips to completed atomically with the session finishing.
   */
  async finish(params: {
    sessionId: string;
    scheduleId: string | null;
    finishedAt: Date;
    durationSec: number;
    totalVolume: number;
    note: string | null;
    sets: SetInput[];
  }): Promise<WorkoutSessionResponse> {
    return prisma.$transaction(async (tx) => {
      await tx.workoutSet.deleteMany({ where: { sessionId: params.sessionId } });

      if (params.sets.length > 0) {
        await tx.workoutSet.createMany({
          data: params.sets.map((s) => ({
            sessionId: params.sessionId,
            exerciseId: s.exerciseId,
            setIndex: s.setIndex,
            reps: s.reps,
            weight: s.weight,
            ...(s.completedAt ? { completedAt: s.completedAt } : {}),
          })),
        });
      }

      const updated = await tx.workoutSession.update({
        where: { id: params.sessionId },
        data: {
          finishedAt: params.finishedAt,
          durationSec: params.durationSec,
          totalVolume: params.totalVolume,
          note: params.note,
        },
        include: sessionInclude,
      });

      if (params.scheduleId) {
        await tx.scheduleWorkout.update({
          where: { id: params.scheduleId },
          data: { isCompleted: true },
        });
      }

      return toResponse(updated);
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.workoutSession.delete({ where: { id } });
  }

  /** Every logged set for a user, optionally windowed — the input to reports. */
  async findSetsForUser(
    userId: string,
    since?: Date,
    exerciseId?: number
  ): Promise<SetWithContext[]> {
    const rows = await prisma.workoutSet.findMany({
      where: {
        ...(exerciseId !== undefined ? { exerciseId } : {}),
        session: {
          userId,
          finishedAt: { not: null },
          ...(since ? { startedAt: { gte: since } } : {}),
        },
      },
      select: {
        sessionId: true,
        exerciseId: true,
        setIndex: true,
        reps: true,
        weight: true,
        completedAt: true,
        exercise: { select: { name: true, category: true } },
        session: { select: { startedAt: true, workout: { select: { name: true } } } },
      },
      orderBy: { completedAt: "asc" },
    });

    return rows.map((r) => ({
      sessionId: r.sessionId,
      exerciseId: r.exerciseId,
      exerciseName: r.exercise.name,
      category: r.exercise.category,
      setIndex: r.setIndex,
      reps: r.reps,
      weight: r.weight,
      completedAt: r.completedAt,
      sessionStartedAt: r.session.startedAt,
      workoutName: r.session.workout.name,
    }));
  }

  /** Finished sessions in a window, used for streaks and weekly aggregates. */
  async findFinishedSummaries(
    userId: string,
    since?: Date
  ): Promise<
    { id: string; workoutName: string; startedAt: Date; durationSec: number; totalVolume: number; setCount: number }[]
  > {
    const rows = await prisma.workoutSession.findMany({
      where: {
        userId,
        finishedAt: { not: null },
        ...(since ? { startedAt: { gte: since } } : {}),
      },
      select: {
        id: true,
        startedAt: true,
        durationSec: true,
        totalVolume: true,
        workout: { select: { name: true } },
        _count: { select: { sets: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    return rows.map((r) => ({
      id: r.id,
      workoutName: r.workout.name,
      startedAt: r.startedAt,
      durationSec: r.durationSec,
      totalVolume: r.totalVolume,
      setCount: r._count.sets,
    }));
  }

  async countFinished(userId: string): Promise<number> {
    return prisma.workoutSession.count({
      where: { userId, finishedAt: { not: null } },
    });
  }
}
