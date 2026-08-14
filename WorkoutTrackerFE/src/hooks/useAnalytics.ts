import { useMemo } from 'react';
import { useWorkouts } from './useWorkouts';
import { useRecentSchedules } from './useSchedules';
import { useExercises } from './useWorkoutExercises';
import { useReports } from './useReports';
import { workoutsApi } from '../api/workouts';
import { reportsApi } from '../api/reports';
import { useQueries, useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getExerciseMuscleGroup, MuscleId } from '../lib/muscleMap';
import { exerciseVolume } from '../utils/format';
import { daysBetween, isoWeekNumber } from '../utils/date';
import { WorkoutExercise } from '../types';

/**
 * Personal records and muscle load come from `/reports/personal-records` and
 * `/reports/muscle-load`, which aggregate the sets the user actually logged.
 *
 * Both fall back to deriving figures from the routine configuration when the
 * account has no logged sessions yet — those numbers assume every planned
 * session was performed exactly as written, which is why the server is
 * preferred whenever it has real data to report.
 */

export interface WorkoutWithExercises {
  workoutId: string;
  workoutName: string;
  exercises: WorkoutExercise[];
}

/** Loads the exercise rows for every routine in one batch. */
export const useAllWorkoutExercises = () => {
  const { workouts, isLoading: workoutsLoading } = useWorkouts();

  const results = useQueries({
    queries: workouts.map((w) => ({
      queryKey: queryKeys.workoutExercises(w.id),
      queryFn: () => workoutsApi.getExercises(w.id),
      enabled: !!w.id,
    })),
  });

  const data = useMemo<WorkoutWithExercises[]>(
    () =>
      workouts.map((w, idx) => ({
        workoutId: w.id,
        workoutName: w.name,
        exercises: (results[idx]?.data || []) as WorkoutExercise[],
      })),
    // `results` identity changes every render; depend on the resolved payloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workouts, results.map((r) => r.dataUpdatedAt).join(',')]
  );

  return {
    data,
    isLoading: workoutsLoading || results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
  };
};

export interface PersonalRecord {
  exerciseId: number;
  exerciseName: string;
  weight: number;
  workoutName: string;
  /** Epley estimate; only present when the record came from logged sets. */
  estimatedOneRepMax?: number;
  achievedAt?: string;
}

/** Heaviest logged weight per exercise, sorted heaviest first. */
export const usePersonalRecords = (): {
  records: PersonalRecord[];
  isLoading: boolean;
} => {
  const serverQuery = useQuery({
    queryKey: queryKeys.personalRecords,
    queryFn: reportsApi.getPersonalRecords,
  });

  const hasServerRecords = (serverQuery.data?.length ?? 0) > 0;

  // Only pay for the per-routine fetches when the server has nothing to report.
  const { data, isLoading } = useAllWorkoutExercises();

  const derived = useMemo(() => {
    const best = new Map<number, PersonalRecord>();
    data.forEach((w) =>
      w.exercises.forEach((ex) => {
        const weight = ex.weight || 0;
        if (weight <= 0) return;
        const current = best.get(ex.exerciseId);
        if (!current || weight > current.weight) {
          best.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName || `#${ex.exerciseId}`,
            weight,
            workoutName: w.workoutName,
          });
        }
      })
    );
    return Array.from(best.values()).sort((a, b) => b.weight - a.weight);
  }, [data]);

  const records = useMemo<PersonalRecord[]>(() => {
    if (!hasServerRecords) return derived;
    return (serverQuery.data ?? []).map((r) => ({
      exerciseId: r.exerciseId,
      exerciseName: r.exerciseName,
      weight: r.bestWeight,
      workoutName: r.category,
      estimatedOneRepMax: r.estimatedOneRepMax,
      achievedAt: r.bestWeightAt,
    }));
  }, [hasServerRecords, serverQuery.data, derived]);

  return { records, isLoading: serverQuery.isLoading || (!hasServerRecords && isLoading) };
};

export interface MuscleLoadEntry {
  muscle: MuscleId;
  volume: number;
  /** 0–1, relative to the most-loaded muscle group. */
  ratio: number;
  level: 'high' | 'medium' | 'low' | 'none';
}

const LOAD_LEVEL = (ratio: number): MuscleLoadEntry['level'] => {
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.4) return 'medium';
  if (ratio > 0) return 'low';
  return 'none';
};

/**
 * Per-muscle training load over the last `days` days (design 07b).
 * Volume of a session = Σ sets × reps × weight of its routine, attributed to
 * the primary muscles at full weight and secondary muscles at half.
 */
export const useMuscleLoad = (days = 7) => {
  const serverQuery = useQuery({
    queryKey: queryKeys.muscleLoad(days),
    queryFn: () => reportsApi.getMuscleLoad(days),
  });

  const { data, isLoading } = useAllWorkoutExercises();
  // The fallback below only looks at the last `days` days, so that is exactly
  // the window worth asking for.
  const { schedules } = useRecentSchedules(days);

  return useMemo(() => {
    const logged = serverQuery.data?.exercises ?? [];

    // Logged sets carry the exercise name, so the same primary/secondary
    // weighting applies — the input is real tonnage instead of planned tonnage.
    if (logged.length > 0) {
      const totals = new Map<MuscleId, number>();
      logged.forEach((ex) => {
        if (ex.volume <= 0) return;
        const mapping = getExerciseMuscleGroup(ex.exerciseName);
        mapping.primary.forEach((m) => totals.set(m, (totals.get(m) || 0) + ex.volume));
        mapping.secondary.forEach((m) => totals.set(m, (totals.get(m) || 0) + ex.volume * 0.5));
      });

      const max = Math.max(1, ...Array.from(totals.values()));
      const entries: MuscleLoadEntry[] = Array.from(totals.entries())
        .map(([muscle, volume]) => {
          const ratio = volume / max;
          return { muscle, volume, ratio, level: LOAD_LEVEL(ratio) };
        })
        .sort((a, b) => b.volume - a.volume);

      const heatmap = entries.reduce<Partial<Record<MuscleId, number>>>((acc, e) => {
        acc[e.muscle] = e.ratio;
        return acc;
      }, {});

      return { entries, heatmap, isLoading: false };
    }

    const recentWorkoutIds = new Set(
      schedules
        .filter((s) => s.isCompleted && daysBetween(s.scheduledDate, new Date()) <= days)
        .map((s) => s.workoutId)
    );

    const totals = new Map<MuscleId, number>();
    data
      .filter((w) => recentWorkoutIds.size === 0 || recentWorkoutIds.has(w.workoutId))
      .forEach((w) =>
        w.exercises.forEach((ex) => {
          const volume = exerciseVolume(ex.sets, ex.repetitions, ex.weight);
          if (volume <= 0) return;
          const mapping = getExerciseMuscleGroup(ex.exerciseName || '');
          mapping.primary.forEach((m) => totals.set(m, (totals.get(m) || 0) + volume));
          mapping.secondary.forEach((m) => totals.set(m, (totals.get(m) || 0) + volume * 0.5));
        })
      );

    const max = Math.max(1, ...Array.from(totals.values()));
    const entries: MuscleLoadEntry[] = Array.from(totals.entries())
      .map(([muscle, volume]) => {
        const ratio = volume / max;
        return { muscle, volume, ratio, level: LOAD_LEVEL(ratio) };
      })
      .sort((a, b) => b.volume - a.volume);

    const heatmap = entries.reduce<Partial<Record<MuscleId, number>>>((acc, e) => {
      acc[e.muscle] = e.ratio;
      return acc;
    }, {});

    return { entries, heatmap, isLoading: serverQuery.isLoading || isLoading };
  }, [data, schedules, days, isLoading, serverQuery.data, serverQuery.isLoading]);
};

export interface ExerciseHistoryPoint {
  week: number;
  weight: number;
  /** No training logged in this week — the weight shown is carried forward. */
  isEmpty: boolean;
}

export interface ExerciseSessionRow {
  date: string;
  workoutName?: string;
  sets: number;
  reps: number;
  weight: number;
  volume?: number;
  isPr: boolean;
}

/**
 * 8-week progression for one exercise (design 04g).
 *
 * Server-backed: the chart and the session rows come from the sets the user
 * logged, so "4 × 8 · 80kg" is what was lifted rather than what the routine
 * prescribed. Accounts with no logged sets fall back to the old estimate,
 * flagged through `isEstimated` so the screen can say so.
 */
export const useExerciseHistory = (exerciseId?: number) => {
  const serverQuery = useQuery({
    queryKey: queryKeys.exerciseHistory(exerciseId ?? 0),
    queryFn: () => reportsApi.getExerciseHistory(exerciseId as number),
    enabled: !!exerciseId,
  });

  const { data, isLoading } = useAllWorkoutExercises();
  // The screen charts 8 weeks and lists the 12 most recent sessions; a year of
  // history covers both with room to spare.
  const { schedules } = useRecentSchedules(365);

  return useMemo(() => {
    if (!exerciseId) {
      return {
        points: [] as ExerciseHistoryPoint[],
        sessions: [] as ExerciseSessionRow[],
        currentPr: 0,
        gain: 0,
        totalSessions: 0,
        isEstimated: false,
        isLoading,
      };
    }

    const remote = serverQuery.data;
    if (remote && remote.totalSessions > 0) {
      return {
        points: remote.points.map((p) => ({
          week: isoWeekNumber(p.weekStart),
          weight: p.weight,
          isEmpty: p.sets === 0,
        })),
        sessions: remote.sessions.map((s) => ({
          date: s.date,
          workoutName: s.workoutName,
          sets: s.sets,
          reps: s.reps,
          weight: s.weight,
          volume: s.volume,
          isPr: s.isPr,
        })),
        currentPr: remote.currentPr,
        gain: remote.gain,
        totalSessions: remote.totalSessions,
        isEstimated: false,
        isLoading: false,
      };
    }

    // ---- fallback: no logged sets yet -------------------------------------
    const owningWorkouts = data.filter((w) =>
      w.exercises.some((ex) => ex.exerciseId === exerciseId)
    );
    const weightFor = (workoutId: string) => {
      const w = owningWorkouts.find((x) => x.workoutId === workoutId);
      const ex = w?.exercises.find((e) => e.exerciseId === exerciseId);
      return ex ? { weight: ex.weight || 0, sets: ex.sets, reps: ex.repetitions } : null;
    };

    const completed = schedules
      .filter((s) => s.isCompleted && owningWorkouts.some((w) => w.workoutId === s.workoutId))
      .sort(
        (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );

    const sessions: ExerciseSessionRow[] = completed.slice(0, 12).map((s) => {
      const info = weightFor(s.workoutId);
      return {
        date: s.scheduledDate,
        workoutName: s.workoutName,
        sets: info?.sets ?? 0,
        reps: info?.reps ?? 0,
        weight: info?.weight ?? 0,
        isPr: false,
      };
    });

    // Mark the newest occurrence of the heaviest weight as the PR row.
    const currentPr = Math.max(0, ...sessions.map((s) => s.weight));
    const prIndex = sessions.findIndex((s) => s.weight === currentPr && currentPr > 0);
    if (prIndex >= 0) sessions[prIndex].isPr = true;

    // Bucket the last 8 ISO weeks; carry the previous weight forward so the
    // chart shows a progression line rather than gaps.
    const byWeek = new Map<number, number>();
    completed.forEach((s) => {
      const info = weightFor(s.workoutId);
      if (!info) return;
      const week = isoWeekNumber(s.scheduledDate);
      byWeek.set(week, Math.max(byWeek.get(week) || 0, info.weight));
    });

    const currentWeek = isoWeekNumber(new Date());
    const points: ExerciseHistoryPoint[] = [];
    let best = 0;
    for (let i = 7; i >= 0; i -= 1) {
      const week = currentWeek - i;
      const value = byWeek.get(week);
      if (value !== undefined) best = value;
      points.push({ week, weight: best, isEmpty: value === undefined });
    }

    const firstNonZero = points.find((p) => p.weight > 0)?.weight || 0;
    const gain = currentPr > 0 ? currentPr - firstNonZero : 0;

    return {
      points,
      sessions,
      currentPr,
      gain,
      totalSessions: sessions.length,
      isEstimated: sessions.length > 0,
      isLoading: serverQuery.isLoading || isLoading,
    };
  }, [data, schedules, exerciseId, isLoading, serverQuery.data, serverQuery.isLoading]);
};

/** Number of completed sessions in the current calendar week. */
export const useWeeklyProgress = () => {
  const { stats } = useReports();
  // At most seven days back — the fallback counts this calendar week only.
  const { schedules } = useRecentSchedules(7);

  return useMemo(() => {
    if (stats?.workoutsThisWeek !== undefined) return stats.workoutsThisWeek;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return schedules.filter(
      (s) => s.isCompleted && new Date(s.scheduledDate) >= startOfWeek
    ).length;
  }, [stats, schedules]);
};

/** Exercise counts per routine, used by the workout list rows (design 03). */
export const useWorkoutSummaries = () => {
  const { data, isLoading } = useAllWorkoutExercises();
  const { workouts } = useWorkouts();
  const { exercises } = useExercises();

  /**
   * `lastPerformedAt` arrives with the plan list. Deriving it on the device
   * meant downloading every schedule the account ever had — "gần nhất" has no
   * date window that is safe to guess, since a plan may last have been trained
   * years ago and still be the answer.
   */
  const lastPerformedByPlan = useMemo(
    () => new Map(workouts.map((w) => [w.id, w.lastPerformedAt ?? undefined])),
    [workouts]
  );

  return useMemo(() => {
    const map = new Map<
      string,
      { exerciseCount: number; lastPerformed?: string; muscles: string[]; minutes: number }
    >();

    data.forEach((w) => {
      const categories = new Set<string>();
      w.exercises.forEach((ex) => {
        const found = exercises.find((e) => e.id === ex.exerciseId);
        if (found?.category) categories.add(found.category);
      });

      // ~9 minutes per exercise is a reasonable planning estimate and matches
      // the "6 bài tập · khoảng 55 phút" figure in the design.
      map.set(w.workoutId, {
        exerciseCount: w.exercises.length,
        lastPerformed: lastPerformedByPlan.get(w.workoutId),
        muscles: Array.from(categories),
        minutes: Math.max(10, w.exercises.length * 9),
      });
    });

    return { summaries: map, isLoading };
  }, [data, lastPerformedByPlan, exercises, isLoading]);
};
