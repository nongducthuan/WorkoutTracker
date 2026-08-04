import { WorkoutPlan } from "@prisma/client";
import {
  WorkoutPlanRepository,
  WorkoutPlanWithScheduledDate,
} from "../repositories/workoutPlan.repository";
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto } from "../dtos/workoutPlan.dto";
import { AppError } from "../errors/appError";

export class WorkoutPlanService {
  private repository: WorkoutPlanRepository;

  constructor() {
    this.repository = new WorkoutPlanRepository();
  }

  async getAll(userId: string): Promise<WorkoutPlanWithScheduledDate[]> {
    return this.repository.findAllByUserId(userId);
  }

  async getById(id: string, userId: string): Promise<WorkoutPlan> {
    const plan = await this.repository.findByIdAndUserId(id, userId);
    if (!plan) {
      throw new AppError("WorkoutPlanNotFound", 404);
    }
    return plan;
  }

  async create(dto: CreateWorkoutPlanDto, userId: string): Promise<WorkoutPlan> {
    const existing = await this.repository.findByNameAndUserId(dto.name, userId);
    if (existing) {
      throw new AppError("WorkoutPlanNameAlreadyExists", 409);
    }

    return this.repository.create({ ...dto, userId });
  }

  async update(id: string, dto: UpdateWorkoutPlanDto, userId: string): Promise<WorkoutPlan> {
    const plan = await this.repository.findByIdAndUserId(id, userId);
    if (!plan) {
      throw new AppError("WorkoutPlanNotFound", 404);
    }

    if (plan.name !== dto.name) {
      const existing = await this.repository.findByNameAndUserId(dto.name, userId, id);
      if (existing) {
        throw new AppError("WorkoutPlanNameAlreadyExists", 409);
      }
    }

    return this.repository.update(id, dto);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const plan = await this.repository.findByIdAndUserId(id, userId);
    if (!plan) {
      throw new AppError("WorkoutPlanNotFound", 404);
    }
    await this.repository.delete(id);
    return { message: "WorkoutPlan deleted successfully" };
  }
}
