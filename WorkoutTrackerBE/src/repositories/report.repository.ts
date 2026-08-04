import { prisma } from "../config/prisma";

export interface WorkoutExerciseRaw {
  sets: number;
  repetitions: number;
  weight: number;
}

export interface CompletedScheduleRaw {
  id: string;
  scheduledDate: Date;
  workout: {
    name: string;
    workoutExercises: WorkoutExerciseRaw[];
  };
}

export class ReportRepository {
  async findCompletedByUserId(userId: string): Promise<CompletedScheduleRaw[]> {
    const rows = await prisma.scheduleWorkout.findMany({
      where: {
        workout: { userId },
        isCompleted: true,
      },
      select: {
        id: true,
        scheduledDate: true,
        workout: {
          select: {
            name: true,
            workoutExercises: {
              select: {
                sets: true,
                repetitions: true,
                weight: true,
              },
            },
          },
        },
      },
    });

    return rows;
  }
}
