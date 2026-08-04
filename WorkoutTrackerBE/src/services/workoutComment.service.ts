import {
  WorkoutCommentRepository,
  WorkoutCommentResponse,
} from "../repositories/workoutComment.repository";
import { CreateWorkoutCommentDto, UpdateWorkoutCommentDto } from "../dtos/workoutComment.dto";
import { AppError } from "../errors/appError";

export class WorkoutCommentService {
  private repository: WorkoutCommentRepository;

  constructor() {
    this.repository = new WorkoutCommentRepository();
  }

  async getByWorkoutId(workoutId: string, userId: string): Promise<WorkoutCommentResponse[]> {
    const isOwner = await this.repository.verifyWorkoutPlanOwnership(workoutId, userId);
    if (!isOwner) {
      throw new AppError("WorkoutPlanNotFound", 404);
    }

    return this.repository.findByWorkoutId(workoutId);
  }

  async create(dto: CreateWorkoutCommentDto, userId: string): Promise<WorkoutCommentResponse> {
    const isOwner = await this.repository.verifyWorkoutPlanOwnership(dto.workoutId, userId);
    if (!isOwner) {
      throw new AppError("WorkoutPlanNotFound", 404);
    }

    return this.repository.create({
      workoutId: dto.workoutId,
      userId,
      comment: dto.comment,
    });
  }

  async update(
    id: string,
    dto: UpdateWorkoutCommentDto,
    userId: string
  ): Promise<WorkoutCommentResponse> {
    const existing = await this.repository.findByIdAndPlanOwner(id, userId);
    if (!existing) {
      throw new AppError("CommentNotFound", 404);
    }

    return this.repository.update(id, dto.comment);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const existing = await this.repository.findByIdAndPlanOwner(id, userId);
    if (!existing) {
      throw new AppError("CommentNotFound", 404);
    }

    await this.repository.delete(id);
    return { message: "Comment deleted successfully" };
  }
}
