import { Workout, WorkoutExercise, WorkoutComment, WorkoutSchedule, Exercise, ReportStats } from '../types';

// ─── In-memory store (replaces localStorage for mock mode in React Native) ───
const store: Record<string, string> = {};

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (!store[key]) {
    store[key] = JSON.stringify(defaultValue);
    return defaultValue;
  }
  try {
    return JSON.parse(store[key]);
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  store[key] = JSON.stringify(value);
};

// ─── Seed Data ───────────────────────────────────────────────────────────────

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 1, name: 'Barbell Bench Press', category: 'Chest', difficulty: 'Intermediate' },
  { id: 2, name: 'Incline Dumbbell Press', category: 'Chest', difficulty: 'Intermediate' },
  { id: 3, name: 'Cable Chest Fly', category: 'Chest', difficulty: 'Beginner' },
  { id: 4, name: 'Barbell Back Squat', category: 'Legs', difficulty: 'Advanced' },
  { id: 5, name: 'Leg Press', category: 'Legs', difficulty: 'Beginner' },
  { id: 6, name: 'Leg Extensions', category: 'Legs', difficulty: 'Beginner' },
  { id: 7, name: 'Conventional Deadlift', category: 'Back', difficulty: 'Advanced' },
  { id: 8, name: 'Lat Pulldown', category: 'Back', difficulty: 'Beginner' },
  { id: 9, name: 'Barbell Row', category: 'Back', difficulty: 'Intermediate' },
  { id: 10, name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate' },
  { id: 11, name: 'Dumbbell Lateral Raise', category: 'Shoulders', difficulty: 'Beginner' },
  { id: 12, name: 'Barbell Bicep Curl', category: 'Arms', difficulty: 'Beginner' },
  { id: 13, name: 'Tricep Rope Pushdown', category: 'Arms', difficulty: 'Beginner' },
  { id: 14, name: 'Incline Bench Skull Crushers', category: 'Arms', difficulty: 'Intermediate' },
  { id: 15, name: 'Hanging Leg Raise', category: 'Core', difficulty: 'Intermediate' },
  { id: 16, name: 'Plank', category: 'Core', difficulty: 'Beginner' },
  { id: 17, name: 'Assault Bike Interval', category: 'Cardio', difficulty: 'Advanced' },
  { id: 18, name: 'Treadmill Run', category: 'Cardio', difficulty: 'Beginner' },
];

const INITIAL_WORKOUTS: Workout[] = [
  { id: 'w1', name: 'Hypertrophy Push A', description: 'Focusing on chest development and lateral shoulder capping.' },
  { id: 'w2', name: 'Heavy Pull Day', description: 'Targeting deadlifts, upper-back thickness, and rear delts.' },
  { id: 'w3', name: 'Leg Destroyer', description: 'Quad focus and high-intensity calf conditioning.' },
  { id: 'w4', name: 'Savage Core & Cardio', description: 'Functional abs workout followed by high intensity intervals.' },
];

const INITIAL_WORKOUT_EXERCISES: WorkoutExercise[] = [
  { id: 'we1', workoutId: 'w1', exerciseId: 1, sets: 4, repetitions: 8, weight: 80 },
  { id: 'we2', workoutId: 'w1', exerciseId: 2, sets: 3, repetitions: 10, weight: 32 },
  { id: 'we3', workoutId: 'w1', exerciseId: 11, sets: 4, repetitions: 15, weight: 12 },
  { id: 'we4', workoutId: 'w1', exerciseId: 13, sets: 3, repetitions: 12, weight: 25 },
  { id: 'we5', workoutId: 'w2', exerciseId: 7, sets: 3, repetitions: 5, weight: 140 },
  { id: 'we6', workoutId: 'w2', exerciseId: 8, sets: 4, repetitions: 10, weight: 65 },
  { id: 'we7', workoutId: 'w2', exerciseId: 12, sets: 3, repetitions: 12, weight: 35 },
  { id: 'we8', workoutId: 'w3', exerciseId: 4, sets: 4, repetitions: 6, weight: 100 },
  { id: 'we9', workoutId: 'w3', exerciseId: 5, sets: 3, repetitions: 10, weight: 180 },
];

const INITIAL_COMMENTS: WorkoutComment[] = [
  { id: 'c1', workoutId: 'w1', comment: 'Absolutely crushed the bench press today. Weight felt lighter!', userName: 'David Laid', userId: 'usr1', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'c2', workoutId: 'w1', comment: 'Try focusing on controlled eccentrics on the lateral raises for massive shoulders.', userName: 'Coach Arnold', userId: 'usr2', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'c3', workoutId: 'w2', comment: 'New PR on deadlift! 140kg x 5 feels clean.', userName: 'Alex Eubank', userId: 'usr1', createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
];

const getRelativeDateStr = (daysFromNow: number, hour: number = 9): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const INITIAL_SCHEDULES: WorkoutSchedule[] = [
  { id: 's1', workoutId: 'w1', scheduledDate: getRelativeDateStr(0, 8) },
  { id: 's2', workoutId: 'w2', scheduledDate: getRelativeDateStr(1, 18) },
  { id: 's3', workoutId: 'w3', scheduledDate: getRelativeDateStr(3, 7) },
  { id: 's4', workoutId: 'w1', scheduledDate: getRelativeDateStr(-2, 9) },
  { id: 's5', workoutId: 'w2', scheduledDate: getRelativeDateStr(-4, 17) },
];

// ─── Mock Database ────────────────────────────────────────────────────────────

export const mockDb = {
  getExercises: (): Exercise[] => getStorageItem('mock_exercises', DEFAULT_EXERCISES),

  getWorkouts: (): Workout[] => getStorageItem('mock_workouts', INITIAL_WORKOUTS),

  saveWorkout: (workout: Omit<Workout, 'id'>): Workout => {
    const workouts = mockDb.getWorkouts();
    const newWorkout = { ...workout, id: 'w_' + Math.random().toString(36).substr(2, 9) };
    workouts.push(newWorkout);
    setStorageItem('mock_workouts', workouts);
    return newWorkout;
  },

  updateWorkout: (id: string, updatedData: Partial<Workout>): Workout => {
    const workouts = mockDb.getWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Workout not found');
    workouts[index] = { ...workouts[index], ...updatedData };
    setStorageItem('mock_workouts', workouts);
    return workouts[index];
  },

  deleteWorkout: (id: string): void => {
    let workouts = mockDb.getWorkouts();
    workouts = workouts.filter(w => w.id !== id);
    setStorageItem('mock_workouts', workouts);
    const exercises = mockDb.getWorkoutExercises(id);
    exercises.forEach(we => mockDb.deleteWorkoutExercise(we.id));
    let comments = getStorageItem<WorkoutComment[]>('mock_comments', INITIAL_COMMENTS);
    comments = comments.filter(c => c.workoutId !== id);
    setStorageItem('mock_comments', comments);
    let schedules = getStorageItem<WorkoutSchedule[]>('mock_schedules', INITIAL_SCHEDULES);
    schedules = schedules.filter(s => s.workoutId !== id);
    setStorageItem('mock_schedules', schedules);
  },

  getWorkoutExercises: (workoutId: string): WorkoutExercise[] => {
    const all = getStorageItem<WorkoutExercise[]>('mock_workout_exercises', INITIAL_WORKOUT_EXERCISES);
    const exercises = mockDb.getExercises();
    return all
      .filter(we => we.workoutId === workoutId)
      .map(we => ({ ...we, exerciseName: exercises.find(e => e.id === we.exerciseId)?.name || 'Unknown Exercise' }));
  },

  addWorkoutExercise: (we: Omit<WorkoutExercise, 'id'>): WorkoutExercise => {
    const all = getStorageItem<WorkoutExercise[]>('mock_workout_exercises', INITIAL_WORKOUT_EXERCISES);
    const newWe = { ...we, id: 'we_' + Math.random().toString(36).substr(2, 9) };
    all.push(newWe);
    setStorageItem('mock_workout_exercises', all);
    const exercises = mockDb.getExercises();
    return { ...newWe, exerciseName: exercises.find(e => e.id === we.exerciseId)?.name || 'Unknown Exercise' };
  },

  updateWorkoutExercise: (id: string, updatedData: Partial<WorkoutExercise>): WorkoutExercise => {
    const all = getStorageItem<WorkoutExercise[]>('mock_workout_exercises', INITIAL_WORKOUT_EXERCISES);
    const index = all.findIndex(we => we.id === id);
    if (index === -1) throw new Error('Workout exercise not found');
    all[index] = { ...all[index], ...updatedData };
    setStorageItem('mock_workout_exercises', all);
    const exercises = mockDb.getExercises();
    return { ...all[index], exerciseName: exercises.find(e => e.id === all[index].exerciseId)?.name || 'Unknown Exercise' };
  },

  deleteWorkoutExercise: (id: string): void => {
    let all = getStorageItem<WorkoutExercise[]>('mock_workout_exercises', INITIAL_WORKOUT_EXERCISES);
    all = all.filter(we => we.id !== id);
    setStorageItem('mock_workout_exercises', all);
  },

  getWorkoutComments: (workoutId: string): WorkoutComment[] => {
    const all = getStorageItem<WorkoutComment[]>('mock_comments', INITIAL_COMMENTS);
    return all.filter(c => c.workoutId === workoutId)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  },

  addWorkoutComment: (comment: Omit<WorkoutComment, 'id'>): WorkoutComment => {
    const all = getStorageItem<WorkoutComment[]>('mock_comments', INITIAL_COMMENTS);
    const newComment = { ...comment, id: 'c_' + Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    all.push(newComment);
    setStorageItem('mock_comments', all);
    return newComment;
  },

  deleteWorkoutComment: (id: string): void => {
    let all = getStorageItem<WorkoutComment[]>('mock_comments', INITIAL_COMMENTS);
    all = all.filter(c => c.id !== id);
    setStorageItem('mock_comments', all);
  },

  getWorkoutSchedules: (): WorkoutSchedule[] => {
    const all = getStorageItem<WorkoutSchedule[]>('mock_schedules', INITIAL_SCHEDULES);
    const workouts = mockDb.getWorkouts();
    return all.map(s => ({ ...s, workoutName: workouts.find(w => w.id === s.workoutId)?.name || 'Deleted Workout' }))
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  },

  getWorkoutSchedulesForWorkout: (workoutId: string): WorkoutSchedule[] =>
    mockDb.getWorkoutSchedules().filter(s => s.workoutId === workoutId),

  addWorkoutSchedule: (schedule: Omit<WorkoutSchedule, 'id'>): WorkoutSchedule => {
    const all = getStorageItem<WorkoutSchedule[]>('mock_schedules', INITIAL_SCHEDULES);
    const newSchedule = { ...schedule, id: 's_' + Math.random().toString(36).substr(2, 9) };
    all.push(newSchedule);
    setStorageItem('mock_schedules', all);
    const workouts = mockDb.getWorkouts();
    return { ...newSchedule, workoutName: workouts.find(w => w.id === schedule.workoutId)?.name || 'Deleted Workout' };
  },

  updateWorkoutSchedule: (id: string, scheduledDate: string): WorkoutSchedule => {
    const all = getStorageItem<WorkoutSchedule[]>('mock_schedules', INITIAL_SCHEDULES);
    const index = all.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');
    all[index].scheduledDate = scheduledDate;
    setStorageItem('mock_schedules', all);
    const workouts = mockDb.getWorkouts();
    return { ...all[index], workoutName: workouts.find(w => w.id === all[index].workoutId)?.name || 'Deleted Workout' };
  },

  deleteWorkoutSchedule: (id: string): void => {
    let all = getStorageItem<WorkoutSchedule[]>('mock_schedules', INITIAL_SCHEDULES);
    all = all.filter(s => s.id !== id);
    setStorageItem('mock_schedules', all);
  },

  getReports: (): ReportStats => {
    const workouts = mockDb.getWorkouts();
    const schedules = mockDb.getWorkoutSchedules();
    const pastSchedules = schedules.filter(s => new Date(s.scheduledDate).getTime() < Date.now());
    let totalVolume = 0;
    const allExercises = getStorageItem<WorkoutExercise[]>('mock_workout_exercises', INITIAL_WORKOUT_EXERCISES);
    allExercises.forEach(we => { totalVolume += we.sets * we.repetitions * we.weight; });
    const weeklyWorkouts = [
      { week: 'Wk 19', count: 3, volume: totalVolume * 0.8 },
      { week: 'Wk 20', count: 4, volume: totalVolume * 0.95 },
      { week: 'Wk 21', count: 5, volume: totalVolume * 1.1 },
      { week: 'Wk 22', count: 6, volume: totalVolume },
    ];
    const recentActivity = pastSchedules.slice(-5).map(s => {
      const w = workouts.find(work => work.id === s.workoutId);
      return { id: s.id, workoutName: s.workoutName || 'Unknown Workout', date: s.scheduledDate, exercisesCount: w ? mockDb.getWorkoutExercises(w.id).length : 0 };
    });
    const now = new Date();
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    return {
      totalWorkouts: pastSchedules.length + 4,
      totalVolume,
      streakDays: 5,
      workoutsThisWeek: schedules.filter(s => { const d = new Date(s.scheduledDate); return d >= startOfWeek && d <= new Date(); }).length + 1,
      weeklyWorkouts,
      recentActivity,
    };
  },
};
