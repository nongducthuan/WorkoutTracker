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

  constructor() {
    this.exerciseRepository = new ExerciseRepository();
  }

  async getAllExercises(query: GetExercisesQueryDto): Promise<PaginatedExercisesResponse> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const { data, total } = await this.exerciseRepository.findMany(query.search, page, pageSize);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }
}
