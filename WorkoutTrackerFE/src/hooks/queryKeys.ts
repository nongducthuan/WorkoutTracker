/** Central react-query key registry so invalidations never miss a cache. */
export const queryKeys = {
  workouts: ['workouts'] as const,
  workout: (id: string) => ['workout', id] as const,
  workoutExercises: (workoutId: string) => ['workout-exercises', workoutId] as const,
  exercisesLibrary: ['exercises-library'] as const,
  exerciseCategories: ['exercise-categories'] as const,
  /** Server-filtered catalogue pages; the filters are part of the key. */
  exerciseSearch: (search: string, category: string | null, maxDifficulty: string | null) =>
    ['exercise-search', search, category, maxDifficulty] as const,
  schedules: ['schedules'] as const,
  workoutSchedules: (workoutId: string) => ['workout-schedules', workoutId] as const,
  comments: (workoutId: string) => ['comments', workoutId] as const,
  reports: ['reports'] as const,
  personalRecords: ['personal-records'] as const,
  muscleLoad: (days: number) => ['muscle-load', days] as const,
  sessions: (params?: Record<string, unknown>) => ['sessions', params ?? {}] as const,
  session: (id: string) => ['session', id] as const,
  settings: ['user-settings'] as const,
  exerciseHistory: (exerciseId: number) => ['exercise-history', exerciseId] as const,
};
