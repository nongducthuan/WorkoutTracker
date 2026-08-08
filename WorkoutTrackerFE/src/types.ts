export interface Exercise {
  id: number;
  name: string;
  category?: string;
  difficulty?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: number;
  workoutId?: string;
  sets: number;
  repetitions: number;
  weight?: number;
  exerciseName?: string;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises?: WorkoutExercise[];
}

export interface WorkoutComment {
  id: string;
  workoutId: string;
  comment: string;
  userName: string;
  userId: string;
  createdAt: string;
}

export interface WorkoutSchedule {
  id: string;
  workoutId: string;
  scheduledDate: string;
  isCompleted?: boolean;
  workoutName?: string;
}

export interface ReportStats {
  weeklyWorkouts: any[];
  recentActivity: any[];
  totalWorkouts?: number;
  totalVolume?: number;
  streakDays?: number;
  workoutsThisWeek?: number;
}
