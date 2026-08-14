import {
  WorkoutSessionRepository,
  WorkoutSessionResponse,
  SetInput,
} from "../repositories/workoutSession.repository";
import {
  CreateSessionDto,
  FinishSessionDto,
  GetSessionsQueryDto,
  SetInputDto,
} from "../dtos/workoutSession.dto";
import { AppError, ErrorCodes } from "../errors/appError";

export interface PaginatedSessions {
  data: WorkoutSessionResponse[];
  total: number;
  page: number;
  pageSize: number;
}

/** Volume is the standard tonnage figure: reps × weight, summed over every set. */
export const computeTotalVolume = (sets: { reps: number; weight: number }[]): number =>
  Math.round(sets.reduce((sum, s) => sum + s.reps * s.weight, 0) * 100) / 100;

const toSetInputs = (sets: SetInputDto[]): SetInput[] =>
  sets.map((s) => ({
    exerciseId: s.exerciseId,
    setIndex: s.setIndex,
    reps: s.reps,
    weight: s.weight,
    completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
  }));

export class WorkoutSessionService {
  private repository: WorkoutSessionRepository;

  constructor(repository: WorkoutSessionRepository = new WorkoutSessionRepository()) {
    this.repository = repository;
  }

  async create(dto: CreateSessionDto, userId: string): Promise<WorkoutSessionResponse> {
    const ownsPlan = await this.repository.verifyWorkoutPlanOwnership(dto.workoutId, userId);
    if (!ownsPlan) {
      throw new AppError("WorkoutPlanNotFound", 404, ErrorCodes.WORKOUT_PLAN_NOT_FOUND);
    }

    if (dto.scheduleId) {
      const ownsSchedule = await this.repository.verifyScheduleOwnership(dto.scheduleId, userId);
      if (!ownsSchedule) {
        throw new AppError("ScheduleNotFound", 404, ErrorCodes.SCHEDULE_NOT_FOUND);
      }
    }

    const startedAt = dto.startedAt ? new Date(dto.startedAt) : new Date();
    const session = await this.repository.create({
      userId,
      workoutId: dto.workoutId,
      scheduleId: dto.scheduleId ?? null,
      startedAt,
    });

    // No sets means "the user just started training"; the session stays open until
    // /finish is called.
    if (!dto.sets) {
      return session;
    }

    return this.finish(
      session.id,
      {
        sets: dto.sets,
        finishedAt: dto.finishedAt,
        durationSec: dto.durationSec,
        note: dto.note,
      },
      userId
    );
  }

  async finish(
    id: string,
    dto: FinishSessionDto,
    userId: string
  ): Promise<WorkoutSessionResponse> {
    const meta = await this.repository.findMetaByIdAndUserId(id, userId);
    if (!meta) {
      throw new AppError("SessionNotFound", 404, ErrorCodes.SESSION_NOT_FOUND);
    }
    if (meta.finishedAt) {
      throw new AppError("SessionAlreadyFinished", 409, ErrorCodes.SESSION_ALREADY_FINISHED);
    }

    const finishedAt = dto.finishedAt ? new Date(dto.finishedAt) : new Date();
    if (finishedAt < meta.startedAt) {
      throw new AppError("InvalidDate", 400, ErrorCodes.INVALID_DATE);
    }

    // Trust the client's stopwatch when it sends one — it knows about pauses the
    // server cannot see — and fall back to wall clock elapsed time otherwise.
    const durationSec =
      dto.durationSec ??
      Math.max(0, Math.round((finishedAt.getTime() - meta.startedAt.getTime()) / 1000));

    const sets = toSetInputs(dto.sets ?? []);

    return this.repository.finish({
      sessionId: id,
      scheduleId: meta.scheduleId,
      finishedAt,
      durationSec,
      totalVolume: computeTotalVolume(sets),
      note: dto.note ?? null,
      sets,
    });
  }

  async getById(id: string, userId: string): Promise<WorkoutSessionResponse> {
    const session = await this.repository.findByIdAndUserId(id, userId);
    if (!session) {
      throw new AppError("SessionNotFound", 404, ErrorCodes.SESSION_NOT_FOUND);
    }
    return session;
  }

  async getAll(query: GetSessionsQueryDto, userId: string): Promise<PaginatedSessions> {
    if (query.from && query.to && query.from > query.to) {
      throw new AppError("InvalidDate", 400, ErrorCodes.INVALID_DATE);
    }

    const { data, total } = await this.repository.findMany({
      userId,
      from: query.from,
      to: query.to,
      workoutId: query.workoutId,
      finishedOnly: query.finishedOnly,
      page: query.page,
      pageSize: query.pageSize,
    });

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const meta = await this.repository.findMetaByIdAndUserId(id, userId);
    if (!meta) {
      throw new AppError("SessionNotFound", 404, ErrorCodes.SESSION_NOT_FOUND);
    }
    await this.repository.delete(id);
    return { message: "Workout session deleted successfully" };
  }
}
