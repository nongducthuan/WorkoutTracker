import { describe, it, expect, vi } from "vitest";
import { UserSettingsService } from "../src/services/userSettings.service";
import { UpdateUserSettingsSchema } from "../src/dtos/userSettings.dto";

const row = (over: Record<string, any> = {}) => ({
  id: "st-1",
  userId: "u-1",
  weeklyGoal: 4,
  preferredDays: "[1,3,5]",
  autoSchedule: false,
  goal: "muscle",
  level: "beginner",
  onboardingCompleted: false,
  weightUnit: "kg",
  restTimerSeconds: 90,
  autoStartRestTimer: true,
  keepScreenOn: true,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
  language: "vi",
  theme: "system",
  updatedAt: new Date("2026-08-14T00:00:00.000Z"),
  ...over,
});

describe("UserSettingsService.get", () => {
  it("parses preferredDays into an array and hides the internal ids", async () => {
    const repo = {
      findByUserId: vi.fn().mockResolvedValue(row()),
      createDefault: vi.fn(),
    } as any;

    const result = await new UserSettingsService(repo).get("u-1");

    expect(result.preferredDays).toEqual([1, 3, 5]);
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("userId");
  });

  it("creates defaults the first time a user asks", async () => {
    const repo = {
      findByUserId: vi.fn().mockResolvedValue(null),
      createDefault: vi.fn().mockResolvedValue(row({ preferredDays: "[]" })),
    } as any;

    const result = await new UserSettingsService(repo).get("u-1");

    expect(repo.createDefault).toHaveBeenCalledWith("u-1");
    expect(result.preferredDays).toEqual([]);
  });

  it("degrades a corrupted column to an empty list instead of throwing", async () => {
    const repo = {
      findByUserId: vi.fn().mockResolvedValue(row({ preferredDays: "not json" })),
    } as any;

    await expect(new UserSettingsService(repo).get("u-1")).resolves.toMatchObject({
      preferredDays: [],
    });
  });
});

describe("UserSettingsService.update", () => {
  it("serialises preferredDays sorted", async () => {
    const repo = {
      upsert: vi.fn().mockResolvedValue(row({ preferredDays: "[1,3,5]" })),
    } as any;

    await new UserSettingsService(repo).update("u-1", { preferredDays: [5, 1, 3] });

    expect(repo.upsert.mock.calls[0][1].preferredDays).toBe("[1,3,5]");
  });

  it("leaves preferredDays alone when the caller did not send it", async () => {
    const repo = { upsert: vi.fn().mockResolvedValue(row()) } as any;

    await new UserSettingsService(repo).update("u-1", { weeklyGoal: 5 });

    expect(repo.upsert.mock.calls[0][1]).toEqual({ weeklyGoal: 5 });
  });
});

describe("UpdateUserSettingsSchema", () => {
  it("accepts a partial update", () => {
    expect(UpdateUserSettingsSchema.safeParse({ weeklyGoal: 6 }).success).toBe(true);
  });

  it("rejects an empty body", () => {
    expect(UpdateUserSettingsSchema.safeParse({}).success).toBe(false);
  });

  it("accepts Sunday as 0 and rejects duplicates or out of range days", () => {
    expect(UpdateUserSettingsSchema.safeParse({ preferredDays: [0, 6] }).success).toBe(true);
    expect(UpdateUserSettingsSchema.safeParse({ preferredDays: [1, 1] }).success).toBe(false);
    expect(UpdateUserSettingsSchema.safeParse({ preferredDays: [-1] }).success).toBe(false);
    expect(UpdateUserSettingsSchema.safeParse({ preferredDays: [7] }).success).toBe(false);
  });

  it("accepts the onboarding answers", () => {
    expect(
      UpdateUserSettingsSchema.safeParse({ goal: "fat_loss", level: "advanced", onboardingCompleted: true })
        .success
    ).toBe(true);
    expect(UpdateUserSettingsSchema.safeParse({ goal: "bulking" }).success).toBe(false);
  });

  it("rejects an unknown unit or theme", () => {
    expect(UpdateUserSettingsSchema.safeParse({ weightUnit: "stone" }).success).toBe(false);
    expect(UpdateUserSettingsSchema.safeParse({ theme: "neon" }).success).toBe(false);
  });

  it("caps the rest timer", () => {
    expect(UpdateUserSettingsSchema.safeParse({ restTimerSeconds: 601 }).success).toBe(false);
    expect(UpdateUserSettingsSchema.safeParse({ restTimerSeconds: 600 }).success).toBe(true);
  });
});
