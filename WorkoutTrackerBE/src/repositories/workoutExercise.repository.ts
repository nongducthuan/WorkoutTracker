import { prisma } from "../config/prisma";
import { WorkoutExercise } from "@prisma/client";

export interface WorkoutExerciseWithExerciseName extends WorkoutExercise {
  exerciseName: string;
}

export class WorkoutExerciseRepository {
  async verifyWorkoutPlanOwnership(workoutId: string, userId: string): Promise<boolean> {
    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id: workoutId,
        userId: userId,
      },
    });
    return !!plan;
  }

  async findByWorkoutId(workoutId: string, userId: string): Promise<WorkoutExerciseWithExerciseName[]> {
    const items = await prisma.workoutExercise.findMany({
      where: {
        workoutId,
        workout: {
          userId,
        },
      },
      include: {
        exercise: true,
      },
      orderBy: { id: "asc" },
    });

    return items.map((item) => ({
      id: item.id,
      workoutId: item.workoutId,
      exerciseId: item.exerciseId,
      sets: item.sets,
      repetitions: item.repetitions,
      weight: item.weight,
      exerciseName: item.exercise.name,
    }));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<WorkoutExercise | null> {
    return prisma.workoutExercise.findFirst({
      where: {
        id,
        workout: {
          userId,
        },
      },
    });
  }

  async create(data: {
    workoutId: string;
    exerciseId: number;
    sets: number;
    repetitions: number;
    weight: number;
  }): Promise<WorkoutExerciseWithExerciseName> {
    const created = await prisma.workoutExercise.create({
      data,
      include: {
        exercise: true,
      },
    });

    return {
      id: created.id,
      workoutId: created.workoutId,
      exerciseId: created.exerciseId,
      sets: created.sets,
      repetitions: created.repetitions,
      weight: created.weight,
      exerciseName: created.exercise.name,
    };
  }

  async update(
    id: string,
    data: {
      exerciseId?: number;
      sets?: number;
      repetitions?: number;
      weight?: number;
    }
  ): Promise<WorkoutExerciseWithExerciseName> {
    const updated = await prisma.workoutExercise.update({
      where: { id },
      data,
      include: {
        exercise: true,
      },
    });

    return {
      id: updated.id,
      workoutId: updated.workoutId,
      exerciseId: updated.exerciseId,
      sets: updated.sets,
      repetitions: updated.repetitions,
      weight: updated.weight,
      exerciseName: updated.exercise.name,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.workoutExercise.delete({
      where: { id },
    });
  }
}
