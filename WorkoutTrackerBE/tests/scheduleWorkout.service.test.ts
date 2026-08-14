import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CreateScheduleWorkoutSchema,
  UpdateScheduleWorkoutSchema,
} from "../src/dtos/scheduleWorkout.dto";

const repo = {
  verifyWorkoutPlanOwnership: vi.fn(),
  findByIdAndUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

vi.mock("../src/repositories/scheduleWorkout.repository", () => ({
  ScheduleWorkoutRepository: class {
    verifyWorkoutPlanOwnership = repo.verifyWorkoutPlanOwnership;
    findByIdAndUserId = repo.findByIdAndUserId;
    create = repo.create;
    update = repo.update;
  },
}));

const { ScheduleWorkoutService } = await import("../src/services/scheduleWorkout.service");

const WORKOUT_ID = "11111111-1111-4111-8111-111111111111";
/** Tomorrow, so the "no scheduling in the past" guard never trips. */
const futureDate = () => new Date(Date.now() + 86_400_000).toISOString();

beforeEach(() => {
  vi.clearAllMocks();
  repo.verifyWorkoutPlanOwnership.mockResolvedValue(true);
  repo.create.mockImplementation(async (data: any) => data);
  repo.update.mockImplementation(async (_id: string, data: any) => data);
});

describe("per-session reminder flag", () => {
  it("carries the toggle from 06b through to the row", async () => {
    const service = new ScheduleWorkoutService();

    await service.create(
      { scheduledDate: futureDate(), workoutId: WORKOUT_ID, remindEnabled: false },
      "u-1"
    );

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ remindEnabled: false })
    );
  });

  it("leaves the field undefined when a client omits it, so the column default wins", async () => {
    const service = new ScheduleWorkoutService();

    await service.create({ scheduledDate: futureDate(), workoutId: WORKOUT_ID }, "u-1");

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ remindEnabled: undefined })
    );
  });

  it("can be flipped on an existing schedule", async () => {
    repo.findByIdAndUserId.mockResolvedValue({ id: "s-1", workoutId: WORKOUT_ID });
    const service = new ScheduleWorkoutService();

    await service.update("s-1", { scheduledDate: futureDate(), remindEnabled: true }, "u-1");

    expect(repo.update).toHaveBeenCalledWith(
      "s-1",
      expect.objectContaining({ remindEnabled: true })
    );
  });

  it("accepts a payload without the field and rejects a non-boolean", () => {
    const base = { scheduledDate: futureDate(), workoutId: WORKOUT_ID };

    expect(CreateScheduleWorkoutSchema.safeParse(base).success).toBe(true);
    expect(
      CreateScheduleWorkoutSchema.safeParse({ ...base, remindEnabled: "yes" }).success
    ).toBe(false);
    expect(
      UpdateScheduleWorkoutSchema.safeParse({
        scheduledDate: futureDate(),
        remindEnabled: 1,
      }).success
    ).toBe(false);
  });
});
