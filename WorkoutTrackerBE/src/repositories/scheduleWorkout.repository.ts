import { prisma } from "../config/prisma";
import { ScheduleWorkout } from "@prisma/client";

export interface ScheduleWorkoutWithWorkoutName {
  id: string;
  scheduledDate: Date;
  workoutId: string;
  workoutName: string;
  isCompleted: boolean;
}

export class ScheduleWorkoutRepository {
  async verifyWorkoutPlanOwnership(workoutId: string, userId: string): Promise<boolean> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: workoutId, userId },
    });
    return !!plan;
  }

  async findAllByUserId(userId: string): Promise<ScheduleWorkoutWithWorkoutName[]> {
    const items = await prisma.scheduleWorkout.findMany({
      where: {
        workout: { userId },
      },
      include: {
        workout: true,
      },
      orderBy: { scheduledDate: "asc" },
    });

    return items.map((item) => ({
      id: item.id,
      scheduledDate: item.scheduledDate,
      workoutId: item.workoutId,
      workoutName: item.workout.name,
      isCompleted: item.isCompleted,
    }));
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

    return items.map((item) => ({
      id: item.id,
      scheduledDate: item.scheduledDate,
      workoutId: item.workoutId,
      workoutName: item.workout.name,
      isCompleted: item.isCompleted,
    }));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<ScheduleWorkout | null> {
    return prisma.scheduleWorkout.findFirst({
      where: {
        id,
        workout: { userId },
      },
    });
  }

  async create(data: { scheduledDate: Date; workoutId: string }): Promise<ScheduleWorkoutWithWorkoutName> {
    const created = await prisma.scheduleWorkout.create({
      data,
      include: { workout: true },
    });

    return {
      id: created.id,
      scheduledDate: created.scheduledDate,
      workoutId: created.workoutId,
      workoutName: created.workout.name,
      isCompleted: created.isCompleted,
    };
  }

  async update(
    id: string,
    data: { scheduledDate: Date; workoutId?: string }
  ): Promise<ScheduleWorkoutWithWorkoutName> {
    const updated = await prisma.scheduleWorkout.update({
      where: { id },
      data,
      include: { workout: true },
    });

    return {
      id: updated.id,
      scheduledDate: updated.scheduledDate,
      workoutId: updated.workoutId,
      workoutName: updated.workout.name,
      isCompleted: updated.isCompleted,
    };
  }

  async complete(id: string): Promise<ScheduleWorkoutWithWorkoutName> {
    const updated = await prisma.scheduleWorkout.update({
      where: { id },
      data: { isCompleted: true },
      include: { workout: true },
    });

    return {
      id: updated.id,
      scheduledDate: updated.scheduledDate,
      workoutId: updated.workoutId,
      workoutName: updated.workout.name,
      isCompleted: updated.isCompleted,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.scheduleWorkout.delete({ where: { id } });
  }
}
