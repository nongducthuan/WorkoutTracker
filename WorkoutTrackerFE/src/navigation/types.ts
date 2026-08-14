export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerify: { email: string };
  ResetPassword: { resetToken: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Schedule: undefined;
  Exercises: undefined;
  Reports: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;

  // Workout flow
  WorkoutDetail: { id: string };
  /** 04b · Đang tập */
  ActiveWorkout: { workoutId: string };
  /** 04c · Tổng kết buổi tập */
  WorkoutSummary: {
    workoutId: string;
    durationSeconds: number;
    totalVolume: number;
    prCount: number;
    exercises: { id: string; name: string; sets: number; weight: number; isPr: boolean }[];
    scheduleId?: string;
    /** ISO timestamp the session started, so the server records real elapsed time. */
    startedAt?: string;
    /** Every set the user actually ticked off, written to the server on confirm. */
    sets?: { exerciseId: number; setIndex: number; reps: number; weight: number }[];
  };
  /** 04d · Chi tiết động tác */
  ExerciseDetail: { exerciseId: number; workoutId?: string };
  /** 04g · Lịch sử động tác */
  ExerciseHistory: { exerciseId: number };

  // Reports
  /** 07c · Bản đồ cơ toàn màn hình */
  MuscleMapFull: undefined;
  Achievements: undefined;

  // Profile & settings
  Profile: undefined;
  EditProfile: undefined;
  WeeklyGoal: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  /** `fromSettings` reopens 01e as an editor: it returns instead of entering the app. */
  OnboardingGoal: { fromSettings?: boolean } | undefined;
  Notifications: undefined;
  About: undefined;
};
