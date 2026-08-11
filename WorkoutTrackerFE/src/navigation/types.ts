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
  WorkoutDetail: { id: string };
  Profile: undefined;
  EditProfile: undefined;
  WeeklyGoal: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  OnboardingGoal: undefined;
  Notifications: undefined;
  Achievements: undefined;
  About: undefined;
};