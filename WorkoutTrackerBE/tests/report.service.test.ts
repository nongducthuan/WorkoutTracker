import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { subDays, subWeeks, startOfDay, startOfWeek } from "date-fns";
import {
  buildExerciseHistory,
  buildMuscleLoad,
  buildPersonalRecords,
  computeStreak,
  estimateOneRepMax,
  ReportService,
} from "../src/services/report.service";
import { SetWithContext } from "../src/repositories/workoutSession.repository";

const makeSet = (over: Partial<SetWithContext> = {}): SetWithContext => ({
  sessionId: "s1",
  exerciseId: 1,
  exerciseName: "Barbell Bench Press",
  category: "Chest",
  setIndex: 1,
  reps: 10,
  weight: 60,
  completedAt: new Date("2026-08-10T10:00:00.000Z"),
  sessionStartedAt: new Date("2026-08-10T09:00:00.000Z"),
  workoutName: "Push Day",
  ...over,
});

describe("estimateOneRepMax", () => {
  it("returns the lifted weight for a single rep", () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it("applies the Epley formula above one rep", () => {
    // 100 * (1 + 10/30) = 133.33
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(133.33, 2);
  });

  it("treats zero or bodyweight sets as no estimate", () => {
    expect(estimateOneRepMax(0, 10)).toBe(0);
    expect(estimateOneRepMax(100, 0)).toBe(0);
  });
});

describe("computeStreak", () => {
  const today = startOfDay(new Date());

  it("is zero without any training", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(computeStreak([today, subDays(today, 1), subDays(today, 2)])).toBe(3);
  });

  it("still counts a streak that ended yesterday", () => {
    expect(computeStreak([subDays(today, 1), subDays(today, 2)])).toBe(2);
  });

  it("breaks once two days are missed", () => {
    expect(computeStreak([subDays(today, 3), subDays(today, 4)])).toBe(0);
  });

  it("collapses several sessions on one day into a single streak day", () => {
    const later = new Date(today.getTime() + 6 * 60 * 60 * 1000);
    expect(computeStreak([today, later, subDays(today, 1)])).toBe(2);
  });

  it("stops at the first gap", () => {
    expect(
      computeStreak([today, subDays(today, 1), subDays(today, 5), subDays(today, 6)])
    ).toBe(2);
  });
});

describe("buildPersonalRecords", () => {
  it("returns nothing when every set is bodyweight", () => {
    expect(buildPersonalRecords([makeSet({ weight: 0 })])).toEqual([]);
  });

  it("keeps the heaviest weight and the best estimated 1RM separately", () => {
    const heavySingle = makeSet({
      weight: 100,
      reps: 1,
      completedAt: new Date("2026-08-01T10:00:00.000Z"),
    });
    // 80 x 12 estimates to 112, which beats the 100kg single.
    const highRep = makeSet({
      weight: 80,
      reps: 12,
      completedAt: new Date("2026-08-08T10:00:00.000Z"),
    });

    const [record] = buildPersonalRecords([heavySingle, highRep]);

    expect(record.bestWeight).toBe(100);
    expect(record.bestWeightReps).toBe(1);
    expect(record.bestWeightAt).toEqual(heavySingle.completedAt);
    expect(record.estimatedOneRepMax).toBeCloseTo(112, 2);
    expect(record.estimatedOneRepMaxAt).toEqual(highRep.completedAt);
    expect(record.bestSetVolume).toBe(960);
    expect(record.totalSets).toBe(2);
  });

  it("groups per exercise and sorts by estimated 1RM", () => {
    const records = buildPersonalRecords([
      makeSet({ exerciseId: 1, exerciseName: "Bench", weight: 60, reps: 5 }),
      makeSet({ exerciseId: 2, exerciseName: "Squat", weight: 120, reps: 5 }),
    ]);

    expect(records.map((r) => r.exerciseName)).toEqual(["Squat", "Bench"]);
  });

  it("keeps the first date when a record is equalled later", () => {
    const first = makeSet({ weight: 100, reps: 5, completedAt: new Date("2026-08-01") });
    const equal = makeSet({ weight: 100, reps: 5, completedAt: new Date("2026-08-09") });

    const [record] = buildPersonalRecords([first, equal]);

    expect(record.bestWeightAt).toEqual(first.completedAt);
  });
});

describe("buildMuscleLoad", () => {
  const from = new Date("2026-08-07T00:00:00.000Z");
  const to = new Date("2026-08-14T00:00:00.000Z");

  it("splits volume across categories and sums the percentages to 100", () => {
    const result = buildMuscleLoad(
      [
        makeSet({ category: "Chest", reps: 10, weight: 60 }), // 600
        makeSet({ category: "Legs", reps: 10, weight: 100, exerciseId: 4 }), // 1000
        makeSet({ category: "Legs", reps: 10, weight: 40, exerciseId: 5 }), // 400
      ],
      7,
      from,
      to
    );

    expect(result.totalVolume).toBe(2000);
    expect(result.totalSets).toBe(3);
    expect(result.groups[0]).toMatchObject({ category: "Legs", volume: 1400, sets: 2, percentage: 70 });
    expect(result.groups[1]).toMatchObject({ category: "Chest", volume: 600, percentage: 30 });
  });

  it("falls back to a share of sets when nothing carried weight", () => {
    const result = buildMuscleLoad(
      [
        makeSet({ category: "Core", weight: 0, reps: 20 }),
        makeSet({ category: "Cardio", weight: 0, reps: 1, exerciseId: 18 }),
      ],
      7,
      from,
      to
    );

    expect(result.totalVolume).toBe(0);
    expect(result.groups.every((g) => g.percentage === 50)).toBe(true);
  });

  it("returns an empty breakdown for an untrained window", () => {
    const result = buildMuscleLoad([], 7, from, to);
    expect(result).toMatchObject({ totalVolume: 0, totalSets: 0, groups: [] });
  });
});

describe("ReportService.generateReport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-14T09:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const sessionRepo = (sessions: any[], sets: SetWithContext[] = []) =>
    ({
      findFinishedSummaries: vi.fn().mockResolvedValue(sessions),
      findSetsForUser: vi.fn().mockResolvedValue(sets),
    }) as any;

  it("reports logged sessions and always returns 8 trend weeks", async () => {
    const now = new Date();
    const service = new ReportService(
      { findCompletedByUserId: vi.fn() } as any,
      sessionRepo([
        { id: "a", workoutName: "Push", startedAt: now, durationSec: 3600, totalVolume: 5000, setCount: 20 },
        {
          id: "b",
          workoutName: "Pull",
          startedAt: subDays(now, 1),
          durationSec: 1800,
          totalVolume: 3000,
          setCount: 12,
        },
      ])
    );

    const report = await service.generateReport("user-1");

    expect(report.source).toBe("sessions");
    expect(report.totalWorkouts).toBe(2);
    expect(report.totalVolume).toBe(8000);
    expect(report.totalSets).toBe(32);
    expect(report.avgDurationSec).toBe(2700);
    expect(report.streakDays).toBe(2);
    expect(report.weeklyWorkouts).toHaveLength(8);
    expect(report.weeklyWorkouts.at(-1)!.count).toBe(2);
  });

  it("ignores sessions older than the trend window without dropping the totals", async () => {
    const service = new ReportService(
      { findCompletedByUserId: vi.fn() } as any,
      sessionRepo([
        {
          id: "old",
          workoutName: "Legs",
          startedAt: subWeeks(new Date(), 20),
          durationSec: 3600,
          totalVolume: 9000,
          setCount: 10,
        },
      ])
    );

    const report = await service.generateReport("user-1");

    expect(report.totalWorkouts).toBe(1);
    expect(report.totalVolume).toBe(9000);
    expect(report.weeklyWorkouts.every((w) => w.count === 0)).toBe(true);
  });

  it("falls back to schedule estimates for accounts with no sessions", async () => {
    const legacyRepo = {
      findCompletedByUserId: vi.fn().mockResolvedValue([
        {
          id: "sch1",
          scheduledDate: new Date(),
          workout: {
            name: "Legacy Plan",
            workoutExercises: [{ sets: 3, repetitions: 10, weight: 50 }],
          },
        },
      ]),
    } as any;

    const report = await new ReportService(legacyRepo, sessionRepo([])).generateReport("u");

    expect(report.source).toBe("schedules");
    expect(report.totalVolume).toBe(1500);
    expect(report.totalSets).toBe(3);
  });

  it("reports an empty state rather than the legacy source when there is no data at all", async () => {
    const report = await new ReportService(
      { findCompletedByUserId: vi.fn().mockResolvedValue([]) } as any,
      sessionRepo([])
    ).generateReport("u");

    expect(report).toMatchObject({ totalWorkouts: 0, totalVolume: 0, source: "sessions" });
    expect(report.weeklyWorkouts).toHaveLength(8);
  });
});

describe("buildExerciseHistory", () => {
  const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });

  const setIn = (
    weeksAgo: number,
    over: Partial<SetWithContext> = {}
  ): SetWithContext => {
    const when = new Date(subWeeks(thisWeek, weeksAgo).getTime() + 36 * 60 * 60 * 1000);
    return makeSet({
      sessionId: `sess-${weeksAgo}-${over.setIndex ?? 1}-${over.weight ?? 60}`,
      sessionStartedAt: when,
      completedAt: when,
      workoutName: "Push Day",
      ...over,
    });
  };

  it("returns an empty 8 week frame when nothing was ever logged", () => {
    const result = buildExerciseHistory([], 1);

    expect(result.points).toHaveLength(8);
    expect(result.points.every((p) => p.weight === 0 && p.sets === 0)).toBe(true);
    expect(result).toMatchObject({ currentPr: 0, currentPrAt: null, gain: 0, sessions: [] });
  });

  it("collapses the sets of one session into a single row keyed on the top set", () => {
    const sessionId = "sess-a";
    const when = new Date(thisWeek.getTime() + 36 * 60 * 60 * 1000);
    const result = buildExerciseHistory(
      [
        makeSet({ sessionId, sessionStartedAt: when, setIndex: 1, reps: 8, weight: 80 }),
        makeSet({ sessionId, sessionStartedAt: when, setIndex: 2, reps: 8, weight: 80 }),
        makeSet({ sessionId, sessionStartedAt: when, setIndex: 3, reps: 5, weight: 90 }),
      ],
      1
    );

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]).toMatchObject({
      sets: 3,
      weight: 90,
      reps: 5,
      volume: 8 * 80 + 8 * 80 + 5 * 90,
      isPr: true,
    });
    expect(result.totalSessions).toBe(1);
  });

  it("prefers more reps when two sets share the top weight", () => {
    const sessionId = "sess-b";
    const when = new Date(thisWeek.getTime() + 36 * 60 * 60 * 1000);
    const result = buildExerciseHistory(
      [
        makeSet({ sessionId, sessionStartedAt: when, setIndex: 1, reps: 5, weight: 90 }),
        makeSet({ sessionId, sessionStartedAt: when, setIndex: 2, reps: 8, weight: 90 }),
      ],
      1
    );

    expect(result.sessions[0]).toMatchObject({ weight: 90, reps: 8 });
  });

  it("carries the last weight through untrained weeks but not before the first one", () => {
    const result = buildExerciseHistory([setIn(5, { weight: 80, reps: 5 })], 1);

    // Weeks 8..6 ago precede any training and stay at zero.
    expect(result.points.slice(0, 2).every((p) => p.weight === 0)).toBe(true);
    // The trained week and every week after it hold 80.
    expect(result.points.slice(3).every((p) => p.weight === 80)).toBe(true);
    expect(result.points.filter((p) => p.sets > 0)).toHaveLength(1);
  });

  it("measures gain between the first and last week that had training", () => {
    const result = buildExerciseHistory(
      [setIn(6, { weight: 60, reps: 8 }), setIn(1, { weight: 85, reps: 5 })],
      1
    );

    expect(result.gain).toBe(25);
  });

  it("reports no gain from a single week of training", () => {
    expect(buildExerciseHistory([setIn(2, { weight: 70 })], 1).gain).toBe(0);
  });

  it("credits the PR to the first session that reached the weight, not the latest", () => {
    const first = setIn(4, { weight: 100, reps: 3 });
    const repeat = setIn(1, { weight: 100, reps: 3 });

    const result = buildExerciseHistory([first, repeat], 1);

    expect(result.currentPr).toBe(100);
    expect(result.currentPrAt).toEqual(first.sessionStartedAt);
    expect(result.sessions.filter((s) => s.isPr)).toHaveLength(1);
    expect(result.sessions.find((s) => s.isPr)!.date).toEqual(first.sessionStartedAt);
  });

  it("keeps an all-time PR that predates the charted window", () => {
    const old = setIn(30, { weight: 120, reps: 2 });
    const recent = setIn(1, { weight: 90, reps: 5 });

    const result = buildExerciseHistory([old, recent], 1);

    expect(result.currentPr).toBe(120);
    // ...while the chart itself only covers the last 8 weeks.
    expect(result.points.every((p) => p.weight <= 90)).toBe(true);
  });

  it("caps the session list", () => {
    const sets = Array.from({ length: 20 }, (_, i) =>
      setIn(i % 8, { weight: 60 + i, setIndex: i + 1 })
    );

    expect(buildExerciseHistory(sets, 1, 8, 5).sessions).toHaveLength(5);
  });

  it("sorts sessions newest first", () => {
    const result = buildExerciseHistory(
      [setIn(5, { weight: 60 }), setIn(1, { weight: 70 }), setIn(3, { weight: 65 })],
      1
    );

    const dates = result.sessions.map((s) => s.date.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });
});
