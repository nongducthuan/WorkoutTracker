import { prisma } from "../config/prisma";
import { Difficulty, Exercise, Prisma } from "@prisma/client";

/** Easiest first — a level includes everything at or below it. */
const DIFFICULTY_LADDER: Difficulty[] = [
  Difficulty.Beginner,
  Difficulty.Intermediate,
  Difficulty.Advanced,
];

export const difficultiesUpTo = (max: Difficulty): Difficulty[] =>
  DIFFICULTY_LADDER.slice(0, DIFFICULTY_LADDER.indexOf(max) + 1);

export interface FindExercisesResult {
  data: Exercise[];
  total: number;
}

export interface FindExercisesFilter {
  search?: string;
  category?: string;
  maxDifficulty?: Difficulty;
  page?: number;
  pageSize?: number;
}

export class ExerciseRepository {
  async findMany(filter: FindExercisesFilter = {}): Promise<FindExercisesResult> {
    const { search, category, maxDifficulty, page = 1, pageSize = 10 } = filter;

    const where: Prisma.ExerciseWhereInput = {
      ...(search ? { name: { contains: search } } : {}),
      ...(category ? { category } : {}),
      ...(maxDifficulty ? { difficulty: { in: difficultiesUpTo(maxDifficulty) } } : {}),
    };

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

  /**
   * The distinct categories present in the catalogue. The client renders one
   * filter chip per category, and it must not depend on which page of results
   * happens to be loaded.
   */
  async findCategories(): Promise<string[]> {
    const rows = await prisma.exercise.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });
    return rows.map((row) => row.category);
  }
}
