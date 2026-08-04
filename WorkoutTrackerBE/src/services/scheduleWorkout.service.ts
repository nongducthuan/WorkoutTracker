import { startOfDay } from "date-fns";
import {
  ScheduleWorkoutRepository,
  ScheduleWorkoutWithWorkoutName,
} from "../repositories/scheduleWorkout.repository";
import {
  CreateScheduleWorkoutDto,
  UpdateScheduleWorkoutDto,
} from "../dtos/scheduleWorkout.dto";
import { AppError } from "../errors/appError";

export class ScheduleWorkoutService {
  private repository: ScheduleWorkoutRepository;

  constructor() {
    this.repository = new ScheduleWorkoutRepository();
  }

  async getAll(userId: string): Promise<ScheduleWorkoutWithWorkoutName[]> {
    return this.repository.findAllByUserId(userId);
  }

  async getByWorkoutId(workoutId: string, userId: string): Promise<ScheduleWorkoutWithWorkoutName[]> {
    const isOwner = await this.repository.verifyWorkoutPlanOwnership(workoutId, userId);
    if (!isOwner) {
      throw new AppError("WorkoutPlanNotFound", 404);
    }
    return this.repository.findByWorkoutId(workoutId, userId);
  }

  async create(dto: CreateScheduleWorkoutDto, userId: string): Promise<ScheduleWorkoutWithWorkoutName> {
    const isOwner = await this.repository.verifyWorkoutPlanOwnership(dto.workoutId, userId);
    if (!isOwner) {
      throw new AppError("WorkoutPlanNotFound", 404);
    }

    const scheduledDateObj = new Date(dto.scheduledDate);
    const today = startOfDay(new Date());
    if (startOfDay(scheduledDateObj) < today) {
      throw new AppError("InvalidDate", 400);
    }

    return this.repository.create({
      scheduledDate: scheduledDateObj,
      workoutId: dto.workoutId,
    });
  }

  async update(
    id: string,
    dto: UpdateScheduleWorkoutDto,
    userId: string
  ): Promise<ScheduleWorkoutWithWorkoutName> {
    const existing = await this.repository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError("ScheduleNotFound", 404);
    }

    const scheduledDateObj = new Date(dto.scheduledDate);
    const today = startOfDay(new Date());
    if (startOfDay(scheduledDateObj) < today) {
      throw new AppError("InvalidDate", 400);
    }

    if (dto.workoutId && dto.workoutId !== existing.workoutId) {
      const isOwner = await this.repository.verifyWorkoutPlanOwnership(dto.workoutId, userId);
      if (!isOwner) {
        throw new AppError("WorkoutPlanNotFound", 404);
      }
    }

    return this.repository.update(id, {
      scheduledDate: scheduledDateObj,
      workoutId: dto.workoutId,
    });
  }

  async complete(id: string, userId: string): Promise<ScheduleWorkoutWithWorkoutName> {
    const existing = await this.repository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError("ScheduleNotFound", 404);
    }

    return this.repository.complete(id);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const existing = await this.repository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError("ScheduleNotFound", 404);
    }

    await this.repository.delete(id);
    return { message: "Scheduled workout deleted successfully." };
  }
}
