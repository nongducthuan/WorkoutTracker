import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tracks which sets of which workout-exercises have been completed,
 * persisted to AsyncStorage per workout. Also exposes a hook so the
 * caller (rest timer) can react whenever a set is checked off.
 */
export function useCompletedSets(workoutId: string, onSetChecked?: () => void) {
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});

  useEffect(() => {
    AsyncStorage.getItem(`completed_sets_${workoutId}`).then((saved) => {
      if (saved) {
        try {
          setCompletedSets(JSON.parse(saved));
        } catch (e) {}
      }
    });
  }, [workoutId]);

  useEffect(() => {
    AsyncStorage.setItem(`completed_sets_${workoutId}`, JSON.stringify(completedSets));
  }, [completedSets, workoutId]);

  const toggleSetCompletion = (weId: string, setIdx: number, totalSets: number) => {
    setCompletedSets((prev) => {
      const current = prev[weId] ? [...prev[weId]] : [];
      while (current.length < totalSets) {
        current.push(false);
      }
      const newVal = !current[setIdx];
      current[setIdx] = newVal;

      if (newVal) {
        onSetChecked?.();
      }

      return { ...prev, [weId]: current };
    });
  };

  const resetCompletedSets = () => {
    setCompletedSets({});
    AsyncStorage.removeItem(`completed_sets_${workoutId}`);
  };

  return { completedSets, toggleSetCompletion, resetCompletedSets };
}
