import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';
import { haptic } from '../utils/haptics';
import { useSettings } from '../context/SettingsContext';
import { WorkoutExercise } from '../types';
import { exerciseVolume } from '../utils/format';

interface PersistedSession {
  workoutId: string;
  startedAt: number;
  /** workoutExercise.id -> array of per-set completion flags */
  completedSets: Record<string, boolean[]>;
}

const emptySession = (workoutId: string): PersistedSession => ({
  workoutId,
  startedAt: Date.now(),
  completedSets: {},
});

const storageKey = (workoutId: string) => `${STORAGE_KEYS.activeWorkout}_${workoutId}`;

export interface ActiveWorkoutSummary {
  durationSeconds: number;
  totalVolume: number;
  completedExercises: {
    id: string;
    name: string;
    sets: number;
    weight: number;
    isPr: boolean;
  }[];
  prCount: number;
}

/**
 * Session engine behind design 04b (Đang tập) and 04c (Tổng kết).
 *
 * Owns three things that used to be spread across the workout-detail screen:
 * which sets are ticked, the rest countdown, and how long the session has been
 * running. State survives navigation and app restarts via AsyncStorage, so
 * leaving the screen mid-session no longer loses progress.
 */
export const useActiveWorkout = (
  workoutId: string,
  exercises: WorkoutExercise[],
  personalRecords?: Map<number, number>
) => {
  const { settings } = useSettings();
  const [session, setSession] = useState<PersistedSession>(() => emptySession(workoutId));
  const [isHydrated, setIsHydrated] = useState(false);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- persistence -------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey(workoutId))
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed: PersistedSession = JSON.parse(raw);
            if (parsed.workoutId === workoutId) setSession(parsed);
          } catch {
            // ignore malformed session and start fresh
          }
        }
      })
      .finally(() => !cancelled && setIsHydrated(true));
    return () => {
      cancelled = true;
    };
  }, [workoutId]);

  useEffect(() => {
    if (!isHydrated || !workoutId) return;
    AsyncStorage.setItem(storageKey(workoutId), JSON.stringify(session)).catch(() => {});
  }, [session, workoutId, isHydrated]);

  // --- elapsed clock -----------------------------------------------------
  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - session.startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.startedAt]);

  // --- rest countdown ----------------------------------------------------
  useEffect(() => {
    if (restSeconds === null) return;
    if (restSeconds <= 0) {
      if (settings.vibrationEnabled) haptic(400);
      setRestSeconds(null);
      return;
    }
    restRef.current = setTimeout(() => setRestSeconds((s) => (s === null ? null : s - 1)), 1000);
    return () => {
      if (restRef.current) clearTimeout(restRef.current as any);
    };
  }, [restSeconds, settings.vibrationEnabled]);

  const startRest = useCallback(
    (seconds?: number) => setRestSeconds(seconds ?? settings.restSeconds),
    [settings.restSeconds]
  );
  const skipRest = useCallback(() => setRestSeconds(null), []);
  const extendRest = useCallback(
    (seconds = 30) => setRestSeconds((s) => (s === null ? seconds : s + seconds)),
    []
  );

  // --- set tracking ------------------------------------------------------
  const toggleSet = useCallback(
    (workoutExerciseId: string, setIndex: number, totalSets: number) => {
      setSession((prev) => {
        const current = prev.completedSets[workoutExerciseId]
          ? [...prev.completedSets[workoutExerciseId]]
          : [];
        while (current.length < totalSets) current.push(false);

        const nextValue = !current[setIndex];
        current[setIndex] = nextValue;

        if (nextValue) {
          if (settings.vibrationEnabled) haptic(30);
          setRestSeconds(settings.restSeconds);
        }

        return {
          ...prev,
          completedSets: { ...prev.completedSets, [workoutExerciseId]: current },
        };
      });
    },
    [settings.restSeconds, settings.vibrationEnabled]
  );

  const reset = useCallback(async () => {
    setSession(emptySession(workoutId));
    setRestSeconds(null);
    await AsyncStorage.removeItem(storageKey(workoutId)).catch(() => {});
  }, [workoutId]);

  // --- derived -----------------------------------------------------------
  const doneCountFor = useCallback(
    (we: WorkoutExercise) => (session.completedSets[we.id] || []).filter(Boolean).length,
    [session.completedSets]
  );

  const currentIndex = useMemo(() => {
    const idx = exercises.findIndex((ex) => doneCountFor(ex) < ex.sets);
    return idx === -1 ? Math.max(0, exercises.length - 1) : idx;
  }, [exercises, doneCountFor]);

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetCount = exercises.reduce((sum, ex) => sum + doneCountFor(ex), 0);
  const isComplete = totalSets > 0 && completedSetCount >= totalSets;

  const summary = useMemo<ActiveWorkoutSummary>(() => {
    const completedExercises = exercises
      .map((ex) => {
        const done = doneCountFor(ex);
        const previousPr = personalRecords?.get(ex.exerciseId) ?? 0;
        return {
          id: ex.id,
          name: ex.exerciseName || `#${ex.exerciseId}`,
          sets: done,
          weight: ex.weight || 0,
          isPr: done > 0 && (ex.weight || 0) > 0 && (ex.weight || 0) >= previousPr,
        };
      })
      .filter((ex) => ex.sets > 0);

    const totalVolume = exercises.reduce(
      (sum, ex) => sum + exerciseVolume(doneCountFor(ex), ex.repetitions, ex.weight),
      0
    );

    return {
      durationSeconds: elapsed,
      totalVolume,
      completedExercises,
      prCount: completedExercises.filter((e) => e.isPr).length,
    };
  }, [exercises, doneCountFor, elapsed, personalRecords]);

  return {
    completedSets: session.completedSets,
    startedAt: session.startedAt,
    elapsed,
    isHydrated,
    restSeconds,
    isResting: restSeconds !== null,
    currentIndex,
    currentExercise: exercises[currentIndex],
    nextExercise: exercises[currentIndex + 1],
    totalSets,
    completedSetCount,
    isComplete,
    summary,
    doneCountFor,
    toggleSet,
    startRest,
    skipRest,
    extendRest,
    reset,
  };
};
