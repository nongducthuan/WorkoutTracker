import { MuscleId } from '../../lib/muscleMap';

/** Category → muscles highlighted on the scanner when that filter is active. */
export const CATEGORY_MUSCLES: Record<string, { primary: MuscleId[]; secondary: MuscleId[] }> = {
  Chest: { primary: ['chest', 'front-deltoid'], secondary: ['triceps'] },
  Back: {
    primary: ['lats', 'trapezius-back'],
    secondary: ['biceps', 'rear-deltoid', 'lower-back'],
  },
  Legs: {
    primary: ['quadriceps', 'hamstrings', 'glutes'],
    secondary: ['calves', 'lower-back'],
  },
  Shoulders: {
    primary: ['front-deltoid', 'rear-deltoid'],
    secondary: ['trapezius-front', 'triceps'],
  },
  Arms: { primary: ['biceps', 'triceps'], secondary: ['forearms-front', 'forearms-back'] },
  Core: { primary: ['abs', 'obliques'], secondary: ['lower-back'] },
};

/** Highlight used by the "All" filter so the body is not left blank. */
export const ALL_MUSCLES = {
  primary: ['chest', 'abs', 'quadriceps', 'biceps', 'front-deltoid', 'obliques'] as MuscleId[],
  secondary: [
    'triceps',
    'forearms-front',
    'lats',
    'trapezius-back',
    'glutes',
    'hamstrings',
    'calves',
    'lower-back',
    'rear-deltoid',
  ] as MuscleId[],
};

/** Reverse lookup: which category owns a muscle, for tap-to-filter. */
export const categoryForMuscle = (muscle: MuscleId): string | undefined =>
  Object.entries(CATEGORY_MUSCLES).find(
    ([, groups]) => groups.primary.includes(muscle) || groups.secondary.includes(muscle)
  )?.[0];
