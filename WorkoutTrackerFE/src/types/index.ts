export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  scheduledDate?: string;
  createdAt?: string;
}

export interface WorkoutExercise {
  id: string;
  sets: number;
  repetitions: number;
  weight: number;
  exerciseId: number;
  workoutId: string;
  exerciseName?: string;
}

export interface WorkoutComment {
  id: string;
  workoutId: string;
  comment: string;
  userName?: string;
  userId?: string;
  createdAt?: string;
}

export interface WorkoutSchedule {
  id: string;
  scheduledDate: string;
  workoutId: string;
  workoutName?: string;
  isCompleted?: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
}

export interface ReportStats {
  totalWorkouts: number;
  totalVolume: number;
  streakDays: number;
  workoutsThisWeek: number;
  weeklyWorkouts: {
    week: string;
    count: number;
    volume: number;
  }[];
  recentActivity: {
    id: string;
    workoutName: string;
    date: string;
    exercisesCount: number;
  }[];
}
