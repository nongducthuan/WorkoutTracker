import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  WorkoutSessionService,
  computeTotalVolume,
} from "../src/services/workoutSession.service";
import { AppError, ErrorCodes } from "../src/errors/appError";

const makeRepo = (over: Record<string, any> = {}) =>
  ({
    verifyWorkoutPlanOwnership: vi.fn().mockResolvedValue(true),
    verifyScheduleOwnership: vi.fn().mockResolvedValue(true),
    create: vi.fn().mockResolvedValue({ id: "sess-1", sets: [] }),
    findMetaByIdAndUserId: vi.fn().mockResolvedValue({
      id: "sess-1",
      scheduleId: null,
      finishedAt: null,
      startedAt: new Date("2026-08-14T08:00:00.000Z"),
    }),
    findByIdAndUserId: vi.fn().mockResolvedValue({ id: "sess-1" }),
    findMany: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    finish: vi.fn().mockImplementation(async (args) => ({ id: args.sessionId, ...args })),
    delete: vi.fn().mockResolvedValue(undefined),
    ...over,
  }) as any;

describe("computeTotalVolume", () => {
  it("sums reps times weight", () => {
    expect(
      computeTotalVolume([
        { reps: 10, weight: 60 },
        { reps: 8, weight: 70 },
      ])
    ).toBe(1160);
  });

  it("is zero for bodyweight work", () => {
    expect(computeTotalVolume([{ reps: 20, weight: 0 }])).toBe(0);
  });

  it("rounds to two decimals rather than accumulating float noise", () => {
    expect(computeTotalVolume([{ reps: 3, weight: 0.1 }])).toBe(0.3);
  });
});

describe("WorkoutSessionService.create", () => {
  let repo: any;
  let service: WorkoutSessionService;

  beforeEach(() => {
    repo = makeRepo();
    service = new WorkoutSessionService(repo);
  });

  it("rejects a plan the caller does not own", async () => {
    repo.verifyWorkoutPlanOwnership.mockResolvedValue(false);

    await expect(service.create({ workoutId: "w1" } as any, "user-1")).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCodes.WORKOUT_PLAN_NOT_FOUND,
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rejects a schedule belonging to somebody else", async () => {
    repo.verifyScheduleOwnership.mockResolvedValue(false);

    await expect(
      service.create({ workoutId: "w1", scheduleId: "sch1" } as any, "user-1")
    ).rejects.toMatchObject({ code: ErrorCodes.SCHEDULE_NOT_FOUND });
  });

  it("leaves the session open when no sets are sent", async () => {
    await service.create({ workoutId: "w1" } as any, "user-1");

    expect(repo.create).toHaveBeenCalledOnce();
    expect(repo.finish).not.toHaveBeenCalled();
  });

  it("logs a finished session in one call when sets are included", async () => {
    // No explicit finishedAt, so the service uses the wall clock: the session
    // has to have started in the past for that to be a valid finish time.
    repo.findMetaByIdAndUserId.mockResolvedValue({
      id: "sess-1",
      scheduleId: null,
      finishedAt: null,
      startedAt: new Date(Date.now() - 60 * 60 * 1000),
    });

    await service.create(
      {
        workoutId: "w1",
        sets: [{ exerciseId: 1, setIndex: 1, reps: 10, weight: 60 }],
      } as any,
      "user-1"
    );

    expect(repo.finish).toHaveBeenCalledOnce();
    expect(repo.finish.mock.calls[0][0].totalVolume).toBe(600);
  });
});

describe("WorkoutSessionService.finish", () => {
  let repo: any;
  let service: WorkoutSessionService;

  beforeEach(() => {
    repo = makeRepo();
    service = new WorkoutSessionService(repo);
  });

  it("404s on an unknown session", async () => {
    repo.findMetaByIdAndUserId.mockResolvedValue(null);

    await expect(service.finish("nope", { sets: [] }, "user-1")).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCodes.SESSION_NOT_FOUND,
    });
  });

  it("refuses to finish a session twice", async () => {
    repo.findMetaByIdAndUserId.mockResolvedValue({
      id: "sess-1",
      scheduleId: null,
      startedAt: new Date("2026-08-14T08:00:00.000Z"),
      finishedAt: new Date("2026-08-14T09:00:00.000Z"),
    });

    await expect(service.finish("sess-1", { sets: [] }, "user-1")).rejects.toMatchObject({
      statusCode: 409,
      code: ErrorCodes.SESSION_ALREADY_FINISHED,
    });
  });

  it("rejects a finish time before the start time", async () => {
    await expect(
      service.finish(
        "sess-1",
        { sets: [], finishedAt: "2026-08-14T07:00:00.000Z" },
        "user-1"
      )
    ).rejects.toMatchObject({ code: ErrorCodes.INVALID_DATE });
  });

  it("derives the duration from the clock when the client sends none", async () => {
    await service.finish(
      "sess-1",
      { sets: [], finishedAt: "2026-08-14T09:30:00.000Z" },
      "user-1"
    );

    expect(repo.finish.mock.calls[0][0].durationSec).toBe(5400);
  });

  it("prefers the client's stopwatch, which knows about pauses", async () => {
    await service.finish(
      "sess-1",
      { sets: [], durationSec: 1200, finishedAt: "2026-08-14T09:30:00.000Z" },
      "user-1"
    );

    expect(repo.finish.mock.calls[0][0].durationSec).toBe(1200);
  });

  it("passes the linked schedule through so it can be marked complete", async () => {
    repo.findMetaByIdAndUserId.mockResolvedValue({
      id: "sess-1",
      scheduleId: "sch-9",
      finishedAt: null,
      startedAt: new Date(Date.now() - 60 * 60 * 1000),
    });

    await service.finish("sess-1", { sets: [] }, "user-1");

    expect(repo.finish.mock.calls[0][0].scheduleId).toBe("sch-9");
  });
});

describe("WorkoutSessionService.getAll", () => {
  it("rejects an inverted date range", async () => {
    const service = new WorkoutSessionService(makeRepo());

    await expect(
      service.getAll(
        {
          from: new Date("2026-08-14"),
          to: new Date("2026-08-01"),
          page: 1,
          pageSize: 20,
        } as any,
        "user-1"
      )
    ).rejects.toBeInstanceOf(AppError);
  });

  it("echoes the paging back with the results", async () => {
    const service = new WorkoutSessionService(makeRepo());

    const result = await service.getAll({ page: 2, pageSize: 5 } as any, "user-1");

    expect(result).toMatchObject({ page: 2, pageSize: 5, total: 0 });
  });
});
