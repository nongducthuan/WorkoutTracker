import { prisma } from "../config/prisma";
import { ScheduleWorkout, WorkoutPlan } from "@prisma/client";

export interface ScheduleWorkoutWithWorkoutName {
  id: string;
  scheduledDate: Date;
  workoutId: string;
  workoutName: string;
  isCompleted: boolean;
  remindEnabled: boolean;
}

const withName = (
  row: ScheduleWorkout & { workout: WorkoutPlan }
): ScheduleWorkoutWithWorkoutName => ({
  id: row.id,
  scheduledDate: row.scheduledDate,
  workoutId: row.workoutId,
  workoutName: row.workout.name,
  isCompleted: row.isCompleted,
  remindEnabled: row.remindEnabled,
});

export class ScheduleWorkoutRepository {
  async verifyWorkoutPlanOwnership(workoutId: string, userId: string): Promise<boolean> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: workoutId, userId },
    });
    return !!plan;
  }

  async findAllByUserId(
    userId: string,
    filter: { from?: Date; to?: Date; workoutId?: string; isCompleted?: boolean } = {}
  ): Promise<ScheduleWorkoutWithWorkoutName[]> {
    const items = await prisma.scheduleWorkout.findMany({
      where: {
        workout: { userId },
        ...(filter.workoutId ? { workoutId: filter.workoutId } : {}),
        ...(filter.isCompleted !== undefined ? { isCompleted: filter.isCompleted } : {}),
        ...(filter.from || filter.to
          ? {
              scheduledDate: {
                ...(filter.from ? { gte: filter.from } : {}),
                ...(filter.to ? { lte: filter.to } : {}),
              },
            }
          : {}),
      },
      include: {
        workout: true,
      },
      orderBy: { scheduledDate: "asc" },
    });

    return items.map(withName);
  }

  async findByWorkoutId(workoutId: string, userId: string): Promise<ScheduleWorkoutWithWorkoutName[]> {
    const items = await prisma.scheduleWorkout.findMany({
      where: {
        workoutId,
        workout: { userId },
      },
      include: {
        workout: true,
      },
      orderBy: { scheduledDate: "asc" },
    });

    return items.map(withName);
  }

  async findByIdAndUserIdWithName(
    id: string,
    userId: string
  ): Promise<ScheduleWorkoutWithWorkoutName | null> {
    const item = await prisma.scheduleWorkout.findFirst({
      where: { id, workout: { userId } },
      include: { workout: true },
    });

    return item ? withName(item) : null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<ScheduleWorkout | null> {
    return prisma.scheduleWorkout.findFirst({
      where: {
        id,
        workout: { userId },
      },
    });
  }

  async create(data: {
    scheduledDate: Date;
    workoutId: string;
    remindEnabled?: boolean;
  }): Promise<ScheduleWorkoutWithWorkoutName> {
    const created = await prisma.scheduleWorkout.create({
      data,
      include: { workout: true },
    });

    return withName(created);
  }

  async update(
    id: string,
    data: { scheduledDate: Date; workoutId?: string; remindEnabled?: boolean }
  ): Promise<ScheduleWorkoutWithWorkoutName> {
    const updated = await prisma.scheduleWorkout.update({
      where: { id },
      data,
      include: { workout: true },
    });

    return withName(updated);
  }

  async complete(id: string): Promise<ScheduleWorkoutWithWorkoutName> {
    const updated = await prisma.scheduleWorkout.update({
      where: { id },
      data: { isCompleted: true },
      include: { workout: true },
    });

    return withName(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.scheduleWorkout.delete({ where: { id } });
  }
}
