import { prisma } from "../config/prisma";
import { WorkoutPlan } from "@prisma/client";

export interface WorkoutPlanWithScheduledDate {
  id: string;
  name: string;
  description: string;
  scheduledDate: Date | null;
}

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

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      scheduledDate: plan.scheduleWorkouts[0]?.scheduledDate ?? null,
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
