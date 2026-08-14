import { AppSettings } from '../context/SettingsContext';

export type FitnessGoal = AppSettings['goal'];
export type FitnessLevel = AppSettings['level'];

export interface Prescription {
  sets: number;
  reps: number;
  restSeconds: number;
}

/**
 * Reps and rest follow the goal, sets follow the level.
 *
 * The two answers collected during onboarding (01e) map onto different knobs:
 * *what* the training is for decides how a set is shaped — heavy and few for
 * size, light and many for endurance — while *how trained* someone is decides
 * how much of it they can take in one session. Combining them into a single
 * lookup table would need nine entries to say the same thing.
 *
 * These are starting points, not rules: every field stays editable on the form,
 * and an exercise already saved keeps whatever it was given.
 */
const BY_GOAL: Record<FitnessGoal, { reps: number; restSeconds: number }> = {
  // Hypertrophy: moderate reps, rest long enough to keep the load up.
  muscle: { reps: 10, restSeconds: 90 },
  // Short rest is the point here — it is what keeps the heart rate up.
  fat_loss: { reps: 15, restSeconds: 45 },
  endurance: { reps: 18, restSeconds: 30 },
};

const SETS_BY_LEVEL: Record<FitnessLevel, number> = {
  beginner: 3,
  intermediate: 4,
  advanced: 5,
};

export const prescriptionFor = (goal: FitnessGoal, level: FitnessLevel): Prescription => ({
  sets: SETS_BY_LEVEL[level] ?? SETS_BY_LEVEL.beginner,
  ...(BY_GOAL[goal] ?? BY_GOAL.muscle),
});

/** i18n keys for naming the goal and level back to the user. */
export const goalLabelKey = (goal: FitnessGoal) =>
  ({
    muscle: 'onboarding.goal_muscle',
    fat_loss: 'onboarding.goal_weight',
    endurance: 'onboarding.goal_active',
  })[goal] ?? 'onboarding.goal_muscle';

export const levelLabelKey = (level: FitnessLevel) =>
  ({
    beginner: 'onboarding.level_beginner',
    intermediate: 'onboarding.level_intermediate',
    advanced: 'onboarding.level_advanced',
  })[level] ?? 'onboarding.level_beginner';

/** The catalogue's `difficulty` values, which are capitalised on the server. */
export const difficultyForLevel = (level: FitnessLevel): 'Beginner' | 'Intermediate' | 'Advanced' =>
  ({
    beginner: 'Beginner' as const,
    intermediate: 'Intermediate' as const,
    advanced: 'Advanced' as const,
  })[level] ?? 'Beginner';
