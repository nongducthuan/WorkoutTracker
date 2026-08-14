import { WorkoutExerciseRepository, WorkoutExerciseWithExerciseName } from "../repositories/workoutExercise.repository";
import { CreateWorkoutExerciseDto, UpdateWorkoutExerciseDto } from "../dtos/workoutExercise.dto";
import { AppError, ErrorCodes } from "../errors/appError";

export class WorkoutExerciseService {
  private repository: WorkoutExerciseRepository;

  constructor() {
    this.repository = new WorkoutExerciseRepository();
  }

  async getByWorkoutId(workoutId: string, userId: string): Promise<WorkoutExerciseWithExerciseName[]> {
    const isOwner = await this.repository.verifyWorkoutPlanOwnership(workoutId, userId);
    if (!isOwner) {
      throw new AppError("WorkoutPlanNotFound", 404, ErrorCodes.WORKOUT_PLAN_NOT_FOUND);
    }

    return this.repository.findByWorkoutId(workoutId, userId);
  }

  async addWorkoutExercise(dto: CreateWorkoutExerciseDto, userId: string): Promise<WorkoutExerciseWithExerciseName> {
    const isOwner = await this.repository.verifyWorkoutPlanOwnership(dto.workoutId, userId);
    if (!isOwner) {
      throw new AppError("WorkoutPlanNotFound", 404, ErrorCodes.WORKOUT_PLAN_NOT_FOUND);
    }

    return this.repository.create(dto);
  }

  async updateWorkoutExercise(
    id: string,
    dto: UpdateWorkoutExerciseDto,
    userId: string
  ): Promise<WorkoutExerciseWithExerciseName> {
    const existing = await this.repository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError("WorkoutExerciseNotFound", 404, ErrorCodes.WORKOUT_EXERCISE_NOT_FOUND);
    }

    return this.repository.update(id, dto);
  }

  async deleteWorkoutExercise(id: string, userId: string): Promise<{ message: string }> {
    const existing = await this.repository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError("WorkoutExerciseNotFound", 404, ErrorCodes.WORKOUT_EXERCISE_NOT_FOUND);
    }

    await this.repository.delete(id);
    return { message: "Workout exercise deleted successfully" };
  }
}
