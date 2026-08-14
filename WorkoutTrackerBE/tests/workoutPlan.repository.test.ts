import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = {
  workoutPlan: { findMany: vi.fn() },
  workoutSession: { groupBy: vi.fn() },
  scheduleWorkout: { groupBy: vi.fn() },
};

vi.mock("../src/config/prisma", () => ({ prisma: prismaMock }));

const { WorkoutPlanRepository } = await import("../src/repositories/workoutPlan.repository");

const plan = (id: string, nextSchedule?: string) => ({
  id,
  name: `Plan ${id}`,
  description: "",
  scheduleWorkouts: nextSchedule ? [{ scheduledDate: new Date(nextSchedule) }] : [],
});

const session = (workoutId: string, startedAt: string) => ({
  workoutId,
  _max: { startedAt: new Date(startedAt) },
});

const completed = (workoutId: string, scheduledDate: string) => ({
  workoutId,
  _max: { scheduledDate: new Date(scheduledDate) },
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.workoutSession.groupBy.mockResolvedValue([]);
  prismaMock.scheduleWorkout.groupBy.mockResolvedValue([]);
});

describe("WorkoutPlanRepository.findAllByUserId · lastPerformedAt", () => {
  it("takes the logged session when it is the more recent of the two", async () => {
    prismaMock.workoutPlan.findMany.mockResolvedValue([plan("p1")]);
    prismaMock.workoutSession.groupBy.mockResolvedValue([session("p1", "2026-08-10T07:00:00Z")]);
    prismaMock.scheduleWorkout.groupBy.mockResolvedValue([
      completed("p1", "2026-08-01T07:00:00Z"),
    ]);

    const [result] = await new WorkoutPlanRepository().findAllByUserId("u-1");

    expect(result.lastPerformedAt).toEqual(new Date("2026-08-10T07:00:00Z"));
  });

  it("takes the ticked-off schedule when that one is more recent", async () => {
    prismaMock.workoutPlan.findMany.mockResolvedValue([plan("p1")]);
    prismaMock.workoutSession.groupBy.mockResolvedValue([session("p1", "2026-07-02T07:00:00Z")]);
    prismaMock.scheduleWorkout.groupBy.mockResolvedValue([
      completed("p1", "2026-08-09T07:00:00Z"),
    ]);

    const [result] = await new WorkoutPlanRepository().findAllByUserId("u-1");

    // Neither source wins by default: a user who logs sessions some weeks and
    // ticks schedules others must see whichever actually happened last.
    expect(result.lastPerformedAt).toEqual(new Date("2026-08-09T07:00:00Z"));
  });

  it("falls back to whichever source exists on its own", async () => {
    prismaMock.workoutPlan.findMany.mockResolvedValue([plan("p1"), plan("p2")]);
    prismaMock.workoutSession.groupBy.mockResolvedValue([session("p1", "2026-08-10T07:00:00Z")]);
    prismaMock.scheduleWorkout.groupBy.mockResolvedValue([
      completed("p2", "2026-08-11T07:00:00Z"),
    ]);

    const [p1, p2] = await new WorkoutPlanRepository().findAllByUserId("u-1");

    expect(p1.lastPerformedAt).toEqual(new Date("2026-08-10T07:00:00Z"));
    expect(p2.lastPerformedAt).toEqual(new Date("2026-08-11T07:00:00Z"));
  });

  it("is null for a plan that has never been trained", async () => {
    prismaMock.workoutPlan.findMany.mockResolvedValue([plan("p1", "2026-08-20T07:00:00Z")]);

    const [result] = await new WorkoutPlanRepository().findAllByUserId("u-1");

    expect(result.lastPerformedAt).toBeNull();
    // The upcoming schedule is a separate field and must not be confused for it.
    expect(result.scheduledDate).toEqual(new Date("2026-08-20T07:00:00Z"));
  });

  it("skips the grouped queries entirely when the user has no plans", async () => {
    prismaMock.workoutPlan.findMany.mockResolvedValue([]);

    await expect(new WorkoutPlanRepository().findAllByUserId("u-1")).resolves.toEqual([]);
    expect(prismaMock.workoutSession.groupBy).not.toHaveBeenCalled();
    expect(prismaMock.scheduleWorkout.groupBy).not.toHaveBeenCalled();
  });

  it("only counts finished sessions, and only the caller's own", async () => {
    prismaMock.workoutPlan.findMany.mockResolvedValue([plan("p1")]);

    await new WorkoutPlanRepository().findAllByUserId("u-1");

    expect(prismaMock.workoutSession.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "u-1",
          finishedAt: { not: null },
        }),
      })
    );
  });
});
