/**
 * Single source of truth for every AsyncStorage key used by the app.
 * Keeping them here prevents writer/reader mismatches (e.g. the settings
 * screen writing `language` while i18n read `pulse_language`).
 */
export const STORAGE_KEYS = {
  authToken: 'workout_tracker_auth_token',
  authUser: 'pulse_user',
  language: 'pulse_language',
  themeMode: '@themeMode',
  appSettings: 'pulse_app_settings',
  onboarding: 'pulse_onboarding',
  weeklyGoal: 'pulse_weekly_goal',
  completedSets: 'pulse_completed_sets',
  activeWorkout: 'pulse_active_workout',
  notificationsRead: 'pulse_notifications_read',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
