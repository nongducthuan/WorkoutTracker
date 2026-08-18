import { ExerciseRepository } from "../repositories/exercise.repository";
import { GetExercisesQueryDto } from "../dtos/exercise.dto";
import { Exercise } from "@prisma/client";

export interface PaginatedExercisesResponse {
  data: Exercise[];
  total: number;
  page: number;
  pageSize: number;
}

export class ExerciseService {
  private exerciseRepository: ExerciseRepository;

  constructor(repository: ExerciseRepository = new ExerciseRepository()) {
    this.exerciseRepository = repository;
  }

  async getAllExercises(query: GetExercisesQueryDto): Promise<PaginatedExercisesResponse> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const { data, total } = await this.exerciseRepository.findMany({
      search: query.search,
      category: query.category,
      maxDifficulty: query.maxDifficulty,
      page,
      pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async getExerciseById(id: number): Promise<Exercise | null> {
    return this.exerciseRepository.findById(id);
  }

  async getCategories(): Promise<string[]> {
    return this.exerciseRepository.findCategories();
  }
}

