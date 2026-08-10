export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
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
  WorkoutDetail: { id: string };
  Profile: undefined;
  EditProfile: undefined;
  WeeklyGoal: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  OnboardingGoal: undefined;
  Notifications: undefined;
  Achievements: undefined;
};
