export interface Exercise {
  id: number;
  name: string;
  category?: string;
  difficulty?: string;
  description?: string;
  /** YouTube URL for the exercise demo video. Null when not set. */
  videoUrl?: string | null;
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
  /** Next uncompleted schedule. Only sent when listing plans. */
  scheduledDate?: string | null;
  /**
   * When the plan was last trained — the later of the newest finished session
   * and the newest completed schedule, computed by the server. Null when the
   * plan has never been trained; absent on responses other than the list.
   */
  lastPerformedAt?: string | null;
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
  /**
   * The per-session "Nhắc nhở" toggle from 06b. Absent on rows written before
   * the column existed, which is why readers treat `undefined` as enabled.
   */
  remindEnabled?: boolean;
}

export interface ReportStats {
  weeklyWorkouts: any[];
  recentActivity: any[];
  totalWorkouts?: number;
  totalVolume?: number;
  streakDays?: number;
  workoutsThisWeek?: number;
  totalSets?: number;
  /** Zero under `source: 'schedules'`, which records no duration. */
  avgDurationSec?: number;
  /**
   * `sessions` — every number comes from sets the user actually logged.
   * `schedules` — the account has no logged session yet, so the report assumes
   * each completed schedule was performed exactly as written in the plan. The
   * report screen says so rather than presenting the estimate as measured.
   */
  source?: 'sessions' | 'schedules';
}