import { prisma } from "../config/prisma";
import { Exercise } from "@prisma/client";

export interface FindExercisesResult {
  data: Exercise[];
  total: number;
}

export class ExerciseRepository {
  async findMany(search?: string, page: number = 1, pageSize: number = 10): Promise<FindExercisesResult> {
    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { id: "asc" },
      }),
      prisma.exercise.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<Exercise | null> {
    return prisma.exercise.findUnique({
      where: { id },
    });
  }
}
