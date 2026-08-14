import { startOfDay } from "date-fns";
import {
  ScheduleWorkoutRepository,
  ScheduleWorkoutWithWorkoutName,
} from "../repositories/scheduleWorkout.repository";
import {
  CreateScheduleWorkoutDto,
  UpdateScheduleWorkoutDto,
  GetSchedulesQueryDto,
} from "../dtos/scheduleWorkout.dto";
import { AppError, ErrorCodes } from "../errors/appError";

export class ScheduleWorkoutService {
  private repository: ScheduleWorkoutRepository;

  constructor() {
    this.repository = new ScheduleWorkoutRepository();
  }

  async getAll(
    userId: string,
    query: GetSchedulesQueryDto = {} as GetSchedulesQueryDto
  ): Promise<ScheduleWorkoutWithWorkoutName[]> {
    if (query.from && query.to && query.from > query.to) {
      throw new AppError("InvalidDate", 400, ErrorCodes.INVALID_DATE);
    }

    return this.repository.findAllByUserId(userId, {
      from: query.from,
      to: query.to,
      workoutId: query.workoutId,
      isCompleted: query.isCompleted,
    });
  }

  async getById(id: string, userId: string): Promise<ScheduleWorkoutWithWorkoutName> {
    const schedule = await this.repository.findByIdAndUserIdWithName(id, userId);
    if (!schedule) {
      throw new AppError("ScheduleNotFound", 404, ErrorCodes.SCHEDULE_NOT_FOUND);
    }
    return schedule;
  }

  async getByWorkoutId(workoutId: string, userId: string): Promise<ScheduleWorkoutWithWorkoutName[]> {
    const isOwner = await this.repository.verifyWorkoutPlanOwnership(workoutId, userId);
    if (!isOwner) {
      throw new AppError("WorkoutPlanNotFound", 404, ErrorCodes.WORKOUT_PLAN_NOT_FOUND);
    }
    return this.repository.findByWorkoutId(workoutId, userId);
  }

  async create(dto: CreateScheduleWorkoutDto, userId: string): Promise<ScheduleWorkoutWithWorkoutName> {
    const isOwner = await this.repository.verifyWorkoutPlanOwnership(dto.workoutId, userId);
    if (!isOwner) {
      throw new AppError("WorkoutPlanNotFound", 404, ErrorCodes.WORKOUT_PLAN_NOT_FOUND);
    }

    const scheduledDateObj = new Date(dto.scheduledDate);
    const today = startOfDay(new Date());
    if (startOfDay(scheduledDateObj) < today) {
      throw new AppError("InvalidDate", 400, ErrorCodes.INVALID_DATE);
    }

    return this.repository.create({
      scheduledDate: scheduledDateObj,
      workoutId: dto.workoutId,
      remindEnabled: dto.remindEnabled,
    });
  }

  async update(
    id: string,
    dto: UpdateScheduleWorkoutDto,
    userId: string
  ): Promise<ScheduleWorkoutWithWorkoutName> {
    const existing = await this.repository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError("ScheduleNotFound", 404, ErrorCodes.SCHEDULE_NOT_FOUND);
    }

    const scheduledDateObj = new Date(dto.scheduledDate);
    const today = startOfDay(new Date());
    if (startOfDay(scheduledDateObj) < today) {
      throw new AppError("InvalidDate", 400, ErrorCodes.INVALID_DATE);
    }

    if (dto.workoutId && dto.workoutId !== existing.workoutId) {
      const isOwner = await this.repository.verifyWorkoutPlanOwnership(dto.workoutId, userId);
      if (!isOwner) {
        throw new AppError("WorkoutPlanNotFound", 404, ErrorCodes.WORKOUT_PLAN_NOT_FOUND);
      }
    }

    return this.repository.update(id, {
      scheduledDate: scheduledDateObj,
      workoutId: dto.workoutId,
      remindEnabled: dto.remindEnabled,
    });
  }

  async complete(id: string, userId: string): Promise<ScheduleWorkoutWithWorkoutName> {
    const existing = await this.repository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError("ScheduleNotFound", 404, ErrorCodes.SCHEDULE_NOT_FOUND);
    }

    return this.repository.complete(id);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const existing = await this.repository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError("ScheduleNotFound", 404, ErrorCodes.SCHEDULE_NOT_FOUND);
    }

    await this.repository.delete(id);
    return { message: "Scheduled workout deleted successfully." };
  }
}
