import { prisma } from "../config/prisma";
import { WorkoutPlan } from "@prisma/client";

export interface WorkoutPlanWithScheduledDate {
  id: string;
  name: string;
  description: string;
  /** Next schedule that has not been completed yet, if any. */
  scheduledDate: Date | null;
  /**
   * When this plan was last actually trained. Two things count as training it,
   * because the app offers both: finishing a logged session, and ticking a
   * schedule off as done. Neither is a subset of the other — a user can log
   * sessions one week and tick schedules the next — so this is the later of the
   * two rather than one with the other as a fallback.
   *
   * It exists so the plan list can show "lần tập gần nhất" without the client
   * downloading the account's whole schedule history to work it out.
   */
  lastPerformedAt: Date | null;
}

const laterOf = (a: Date | null, b: Date | null): Date | null => {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
};

export class WorkoutPlanRepository {
  async findAllByUserId(userId: string): Promise<WorkoutPlanWithScheduledDate[]> {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        scheduleWorkouts: {
          where: { isCompleted: false },
          orderBy: { scheduledDate: "asc" },
          take: 1,
        },
      },
    });

    if (plans.length === 0) return [];

    const planIds = plans.map((plan) => plan.id);

    // Two grouped queries rather than a per-plan include: the answer is one
    // date per plan, so there is no reason to carry the rows themselves back.
    const [lastSessions, lastCompletedSchedules] = await Promise.all([
      prisma.workoutSession.groupBy({
        by: ["workoutId"],
        where: { userId, workoutId: { in: planIds }, finishedAt: { not: null } },
        _max: { startedAt: true },
      }),
      prisma.scheduleWorkout.groupBy({
        by: ["workoutId"],
        where: { workoutId: { in: planIds }, isCompleted: true },
        _max: { scheduledDate: true },
      }),
    ]);

    const sessionByPlan = new Map(
      lastSessions.map((row) => [row.workoutId, row._max.startedAt ?? null])
    );
    const scheduleByPlan = new Map(
      lastCompletedSchedules.map((row) => [row.workoutId, row._max.scheduledDate ?? null])
    );

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      scheduledDate: plan.scheduleWorkouts[0]?.scheduledDate ?? null,
      lastPerformedAt: laterOf(
        sessionByPlan.get(plan.id) ?? null,
        scheduleByPlan.get(plan.id) ?? null
      ),
    }));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<WorkoutPlan | null> {
    return prisma.workoutPlan.findFirst({
      where: { id, userId },
    });
  }

  async findByNameAndUserId(
    name: string,
    userId: string,
    excludeId?: string
  ): Promise<WorkoutPlan | null> {
    return prisma.workoutPlan.findFirst({
      where: {
        name: { equals: name },
        userId,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async create(data: { name: string; description: string; userId: string }): Promise<WorkoutPlan> {
    return prisma.workoutPlan.create({ data });
  }

  async update(
    id: string,
    data: { name: string; description: string }
  ): Promise<WorkoutPlan> {
    return prisma.workoutPlan.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.workoutPlan.delete({ where: { id } });
  }
}
