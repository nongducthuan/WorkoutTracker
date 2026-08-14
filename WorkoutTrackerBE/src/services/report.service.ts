import {
  getISOWeek,
  startOfWeek,
  startOfDay,
  subDays,
  subWeeks,
  isSameDay,
  addWeeks,
} from "date-fns";
import { ReportRepository } from "../repositories/report.repository";
import {
  WorkoutSessionRepository,
  SetWithContext,
} from "../repositories/workoutSession.repository";

export interface WeeklyWorkoutDto {
  week: string;
  count: number;
  volume: number;
}

export interface RecentActivityDto {
  id: string;
  date: Date;
  workoutName: string;
  exercisesCount: number;
}

export interface WorkoutReportDto {
  totalWorkouts: number;
  totalVolume: number;
  streakDays: number;
  workoutsThisWeek: number;
  weeklyWorkouts: WeeklyWorkoutDto[];
  recentActivity: RecentActivityDto[];
  totalSets: number;
  avgDurationSec: number;
  /**
   * `sessions` = derived from workouts the user actually logged.
   * `schedules` = legacy fallback that assumes every completed schedule was
   * performed exactly as planned. Clients can use this to warn that the numbers
   * are estimates.
   */
  source: "sessions" | "schedules";
}

export interface PersonalRecordDto {
  exerciseId: number;
  exerciseName: string;
  category: string;
  bestWeight: number;
  bestWeightReps: number;
  bestWeightAt: Date;
  estimatedOneRepMax: number;
  estimatedOneRepMaxAt: Date;
  bestSetVolume: number;
  totalSets: number;
}

export interface MuscleLoadGroupDto {
  category: string;
  volume: number;
  sets: number;
  reps: number;
  percentage: number;
}

export interface MuscleLoadExerciseDto {
  exerciseId: number;
  exerciseName: string;
  category: string;
  volume: number;
  sets: number;
  reps: number;
}

export interface MuscleLoadDto {
  days: number;
  from: Date;
  to: Date;
  totalVolume: number;
  totalSets: number;
  groups: MuscleLoadGroupDto[];
  /**
   * Per-exercise breakdown. The app maps exercise names onto individual muscles
   * for the body heatmap, which a category-level grouping cannot express.
   */
  exercises: MuscleLoadExerciseDto[];
}

const WEEKS_IN_TREND = 8;

export interface ExerciseHistoryPointDto {
  /** Monday of the bucket, so the client can label it however it likes. */
  weekStart: Date;
  week: string;
  /** Heaviest weight moved that week, carried forward across untrained weeks. */
  weight: number;
  volume: number;
  sets: number;
}

export interface ExerciseHistorySessionDto {
  sessionId: string;
  date: Date;
  workoutName: string;
  sets: number;
  /** Reps of the top set, which is what the design's "4 × 8 · 80kg" row shows. */
  reps: number;
  weight: number;
  volume: number;
  isPr: boolean;
}

export interface ExerciseHistoryDto {
  exerciseId: number;
  exerciseName: string;
  currentPr: number;
  currentPrAt: Date | null;
  estimatedOneRepMax: number;
  /** Change in top weight across the window; 0 when there is nothing to compare. */
  gain: number;
  totalSessions: number;
  points: ExerciseHistoryPointDto[];
  sessions: ExerciseHistorySessionDto[];
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Epley formula — the usual estimate when a true 1RM was never attempted. */
export const estimateOneRepMax = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return round2(weight * (1 + reps / 30));
};

/** Consecutive days trained, counting back from today (or yesterday). */
export const computeStreak = (dates: Date[]): number => {
  const uniqueDesc = Array.from(
    new Map(
      dates.map((d) => {
        const day = startOfDay(d);
        return [day.getTime(), day];
      })
    ).values()
  ).sort((a, b) => b.getTime() - a.getTime());

  if (uniqueDesc.length === 0) return 0;

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const mostRecent = uniqueDesc[0];

  // A gap of two or more days breaks the streak entirely; training yesterday but
  // not yet today still counts, otherwise the number would collapse every morning.
  if (!isSameDay(mostRecent, today) && !isSameDay(mostRecent, yesterday)) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDesc.length; i++) {
    if (isSameDay(uniqueDesc[i], subDays(uniqueDesc[i - 1], 1))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * A continuous run of the last N ISO weeks, including weeks with no training, so
 * the trend chart never silently compresses a lay-off into a flat line.
 */
const buildWeeklyTrend = (
  entries: { date: Date; volume: number }[],
  weeks: number = WEEKS_IN_TREND
): WeeklyWorkoutDto[] => {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const buckets: WeeklyWorkoutDto[] = [];
  const indexByTime = new Map<number, number>();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = subWeeks(thisWeekStart, i);
    indexByTime.set(weekStart.getTime(), buckets.length);
    buckets.push({ week: `W${getISOWeek(weekStart)}`, count: 0, volume: 0 });
  }

  const oldest = subWeeks(thisWeekStart, weeks - 1);
  const newest = addWeeks(thisWeekStart, 1);

  for (const entry of entries) {
    if (entry.date < oldest || entry.date >= newest) continue;
    const weekStart = startOfWeek(entry.date, { weekStartsOn: 1 });
    const index = indexByTime.get(weekStart.getTime());
    if (index === undefined) continue;
    buckets[index].count += 1;
    buckets[index].volume += entry.volume;
  }

  return buckets.map((b) => ({ ...b, volume: round2(b.volume) }));
};

export class ReportService {
  private repository: ReportRepository;
  private sessionRepository: WorkoutSessionRepository;

  constructor(
    repository: ReportRepository = new ReportRepository(),
    sessionRepository: WorkoutSessionRepository = new WorkoutSessionRepository()
  ) {
    this.repository = repository;
    this.sessionRepository = sessionRepository;
  }

  async generateReport(userId: string): Promise<WorkoutReportDto> {
    const sessions = await this.sessionRepository.findFinishedSummaries(userId);

    // Accounts created before session tracking existed have no sessions at all;
    // fall back to the old schedule-derived estimate rather than showing zeros.
    if (sessions.length === 0) {
      return this.generateLegacyReport(userId);
    }

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const totalVolume = round2(sessions.reduce((sum, s) => sum + s.totalVolume, 0));
    const totalSets = sessions.reduce((sum, s) => sum + s.setCount, 0);
    const totalDuration = sessions.reduce((sum, s) => sum + s.durationSec, 0);

    return {
      totalWorkouts: sessions.length,
      totalVolume,
      totalSets,
      avgDurationSec: Math.round(totalDuration / sessions.length),
      streakDays: computeStreak(sessions.map((s) => s.startedAt)),
      workoutsThisWeek: sessions.filter((s) => s.startedAt >= weekStart).length,
      weeklyWorkouts: buildWeeklyTrend(
        sessions.map((s) => ({ date: s.startedAt, volume: s.totalVolume }))
      ),
      recentActivity: sessions.slice(0, 5).map((s) => ({
        id: s.id,
        date: s.startedAt,
        workoutName: s.workoutName,
        exercisesCount: s.setCount,
      })),
      source: "sessions",
    };
  }

  private async generateLegacyReport(userId: string): Promise<WorkoutReportDto> {
    const schedules = await this.repository.findCompletedByUserId(userId);

    if (schedules.length === 0) {
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        totalSets: 0,
        avgDurationSec: 0,
        streakDays: 0,
        workoutsThisWeek: 0,
        weeklyWorkouts: buildWeeklyTrend([]),
        recentActivity: [],
        source: "sessions",
      };
    }

    const volumeOf = (s: (typeof schedules)[number]): number =>
      s.workout.workoutExercises.reduce(
        (sum, we) => sum + we.sets * we.repetitions * we.weight,
        0
      );

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const todayEnd = startOfDay(new Date());

    return {
      totalWorkouts: schedules.length,
      totalVolume: round2(schedules.reduce((sum, s) => sum + volumeOf(s), 0)),
      totalSets: schedules.reduce(
        (sum, s) => sum + s.workout.workoutExercises.reduce((n, we) => n + we.sets, 0),
        0
      ),
      avgDurationSec: 0,
      streakDays: computeStreak(schedules.map((s) => s.scheduledDate)),
      workoutsThisWeek: schedules.filter((s) => {
        const d = startOfDay(s.scheduledDate);
        return d >= weekStart && d <= todayEnd;
      }).length,
      weeklyWorkouts: buildWeeklyTrend(
        schedules.map((s) => ({ date: s.scheduledDate, volume: volumeOf(s) }))
      ),
      recentActivity: schedules
        .slice()
        .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime())
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          date: s.scheduledDate,
          workoutName: s.workout.name,
          exercisesCount: s.workout.workoutExercises.length,
        })),
      source: "schedules",
    };
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecordDto[]> {
    const sets = await this.sessionRepository.findSetsForUser(userId);
    return buildPersonalRecords(sets);
  }

  async getExerciseHistory(
    userId: string,
    exerciseId: number,
    weeks: number,
    sessionLimit: number
  ): Promise<ExerciseHistoryDto> {
    // Pull the full history, not just the charted window: the all-time PR is
    // what a "PR" badge should mean, and it may predate the last 8 weeks.
    const sets = await this.sessionRepository.findSetsForUser(userId, undefined, exerciseId);
    return buildExerciseHistory(sets, exerciseId, weeks, sessionLimit);
  }

  async getMuscleLoad(userId: string, days: number): Promise<MuscleLoadDto> {
    const to = new Date();
    const from = startOfDay(subDays(to, days - 1));
    const sets = await this.sessionRepository.findSetsForUser(userId, from);
    return buildMuscleLoad(sets, days, from, to);
  }
}

/** Exported separately so the aggregation can be unit tested without a database. */
export const buildPersonalRecords = (sets: SetWithContext[]): PersonalRecordDto[] => {
  const byExercise = new Map<number, PersonalRecordDto>();

  for (const set of sets) {
    if (set.weight <= 0 || set.reps <= 0) continue;

    const e1rm = estimateOneRepMax(set.weight, set.reps);
    const setVolume = round2(set.weight * set.reps);
    const existing = byExercise.get(set.exerciseId);

    if (!existing) {
      byExercise.set(set.exerciseId, {
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        category: set.category,
        bestWeight: set.weight,
        bestWeightReps: set.reps,
        bestWeightAt: set.completedAt,
        estimatedOneRepMax: e1rm,
        estimatedOneRepMaxAt: set.completedAt,
        bestSetVolume: setVolume,
        totalSets: 1,
      });
      continue;
    }

    existing.totalSets += 1;

    // Ties go to the earlier set: the record was set the first time it was hit.
    if (set.weight > existing.bestWeight) {
      existing.bestWeight = set.weight;
      existing.bestWeightReps = set.reps;
      existing.bestWeightAt = set.completedAt;
    }
    if (e1rm > existing.estimatedOneRepMax) {
      existing.estimatedOneRepMax = e1rm;
      existing.estimatedOneRepMaxAt = set.completedAt;
    }
    if (setVolume > existing.bestSetVolume) {
      existing.bestSetVolume = setVolume;
    }
  }

  return Array.from(byExercise.values()).sort(
    (a, b) => b.estimatedOneRepMax - a.estimatedOneRepMax
  );
};

export const buildMuscleLoad = (
  sets: SetWithContext[],
  days: number,
  from: Date,
  to: Date
): MuscleLoadDto => {
  const byCategory = new Map<string, MuscleLoadGroupDto>();
  const byExercise = new Map<number, MuscleLoadExerciseDto>();
  let totalVolume = 0;

  for (const set of sets) {
    const volume = set.reps * set.weight;
    totalVolume += volume;

    const exercise = byExercise.get(set.exerciseId);
    if (exercise) {
      exercise.volume += volume;
      exercise.sets += 1;
      exercise.reps += set.reps;
    } else {
      byExercise.set(set.exerciseId, {
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        category: set.category,
        volume,
        sets: 1,
        reps: set.reps,
      });
    }

    const group = byCategory.get(set.category);
    if (group) {
      group.volume += volume;
      group.sets += 1;
      group.reps += set.reps;
    } else {
      byCategory.set(set.category, {
        category: set.category,
        volume,
        sets: 1,
        reps: set.reps,
        percentage: 0,
      });
    }
  }

  const groups = Array.from(byCategory.values())
    .map((g) => ({
      ...g,
      volume: round2(g.volume),
      // Bodyweight work logs zero volume, so fall back to share of sets rather
      // than reporting 0% for a category the user clearly trained.
      percentage:
        totalVolume > 0
          ? round2((g.volume / totalVolume) * 100)
          : round2((g.sets / Math.max(1, sets.length)) * 100),
    }))
    .sort((a, b) => b.volume - a.volume || b.sets - a.sets);

  return {
    days,
    from,
    to,
    totalVolume: round2(totalVolume),
    totalSets: sets.length,
    groups,
    exercises: Array.from(byExercise.values())
      .map((e) => ({ ...e, volume: round2(e.volume) }))
      .sort((a, b) => b.volume - a.volume || b.sets - a.sets),
  };
};

/**
 * Per-exercise progression for design 04g, built from logged sets.
 *
 * Exported for unit testing without a database.
 */
export const buildExerciseHistory = (
  sets: SetWithContext[],
  exerciseId: number,
  weeks: number = WEEKS_IN_TREND,
  sessionLimit: number = 12
): ExerciseHistoryDto => {
  const empty: ExerciseHistoryDto = {
    exerciseId,
    exerciseName: "",
    currentPr: 0,
    currentPrAt: null,
    estimatedOneRepMax: 0,
    gain: 0,
    totalSessions: 0,
    points: buildEmptyWeeks(weeks),
    sessions: [],
  };

  if (sets.length === 0) return empty;

  // ---- group by session ---------------------------------------------------
  const bySession = new Map<string, ExerciseHistorySessionDto>();
  for (const set of sets) {
    const existing = bySession.get(set.sessionId);
    const volume = set.reps * set.weight;

    if (!existing) {
      bySession.set(set.sessionId, {
        sessionId: set.sessionId,
        date: set.sessionStartedAt,
        workoutName: set.workoutName,
        sets: 1,
        reps: set.reps,
        weight: set.weight,
        volume,
        isPr: false,
      });
      continue;
    }

    existing.sets += 1;
    existing.volume += volume;
    // The top set defines the row: heaviest weight, and at equal weight the
    // one that got more reps.
    if (set.weight > existing.weight || (set.weight === existing.weight && set.reps > existing.reps)) {
      existing.weight = set.weight;
      existing.reps = set.reps;
    }
  }

  const sessions = Array.from(bySession.values())
    .map((s) => ({ ...s, volume: round2(s.volume) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // ---- all-time PR --------------------------------------------------------
  const currentPr = Math.max(...sessions.map((s) => s.weight));
  // Earliest session at that weight: the record was set the first time it was hit.
  const prSession = currentPr > 0
    ? sessions.filter((s) => s.weight === currentPr).at(-1)
    : undefined;
  if (prSession) prSession.isPr = true;

  const estimatedOneRepMax = sets.reduce(
    (best, set) => Math.max(best, estimateOneRepMax(set.weight, set.reps)),
    0
  );

  // ---- weekly buckets -----------------------------------------------------
  const points = buildEmptyWeeks(weeks);
  const indexByTime = new Map(points.map((p, i) => [p.weekStart.getTime(), i]));

  for (const set of sets) {
    const weekStart = startOfWeek(set.sessionStartedAt, { weekStartsOn: 1 });
    const index = indexByTime.get(weekStart.getTime());
    if (index === undefined) continue;
    points[index].weight = Math.max(points[index].weight, set.weight);
    points[index].volume += set.reps * set.weight;
    points[index].sets += 1;
  }

  // Weeks with no training inherit the previous week's weight so the chart reads
  // as a progression line rather than dropping to the floor during a rest week.
  // A leading gap stays at 0: there is no earlier weight to carry.
  let carried = 0;
  for (const point of points) {
    if (point.sets > 0) {
      carried = point.weight;
    } else {
      point.weight = carried;
    }
    point.volume = round2(point.volume);
  }

  const trained = points.filter((p) => p.sets > 0);
  const gain =
    trained.length >= 2 ? round2(trained[trained.length - 1].weight - trained[0].weight) : 0;

  return {
    exerciseId,
    exerciseName: sets[0].exerciseName,
    currentPr,
    currentPrAt: prSession?.date ?? null,
    estimatedOneRepMax,
    gain,
    totalSessions: sessions.length,
    points,
    sessions: sessions.slice(0, sessionLimit),
  };
};

const buildEmptyWeeks = (weeks: number): ExerciseHistoryPointDto[] => {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const points: ExerciseHistoryPointDto[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = subWeeks(thisWeekStart, i);
    points.push({
      weekStart,
      week: `W${getISOWeek(weekStart)}`,
      weight: 0,
      volume: 0,
      sets: 0,
    });
  }
  return points;
};
