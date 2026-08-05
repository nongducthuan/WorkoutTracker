# Task: Migrate WorkoutTrackerFE → React Native CLI

## Phase 1: Project Init
- [x] Init RN CLI project `WorkoutTrackerFE_RN`
- [x] Install dependencies
- [x] Configure tsconfig, babel, metro

## Phase 2: Theme & Core
- [x] `src/theme/colors.ts` - PULSE design tokens
- [x] `src/theme/styles.ts` (Global StyleSheet)

## Phase 3: Business Logic (migrate src/)
- [x] `src/api/client.ts`
- [x] `src/api/auth.ts` (AsyncStorage thay SecureStore)
- [x] `src/api/workouts.ts`, `exercises.ts`, `schedules.ts`, `reports.ts`, `comments.ts`
- [x] `src/api/mockDb.ts`
- [x] `src/hooks/useFitnessData.ts`
- [x] `src/types/index.ts`
- [x] `src/lib/muscleMap.ts`
- [x] `src/i18n.ts` + locales/

## Phase 4: Navigation
- [x] `src/navigation/RootNavigator.tsx`
- [x] `src/navigation/AuthStack.tsx`
- [x] `src/navigation/MainTabs.tsx`

## Phase 5: Components
- [x] `src/components/Toast.tsx`
- [x] `src/components/ConfirmDialog.tsx`
- [x] `src/components/EmptyState.tsx`
- [x] `src/components/Modal.tsx`
- [x] `src/components/MuscleMap.tsx`
- [x] `src/components/LoadingSkeleton.tsx`

## Phase 6: Screens (Completed)
- [x] `src/screens/LoginScreen.tsx`
- [x] `src/screens/RegisterScreen.tsx`
- [x] `src/screens/DashboardScreen.tsx`
- [x] `src/screens/WorkoutsScreen.tsx`
- [x] `src/screens/ScheduleScreen.tsx` (Fully Implemented)
- [x] `src/screens/ExercisesScreen.tsx` (Fully Implemented)
- [x] `src/screens/ReportsScreen.tsx` (Fully Implemented)
- [x] `src/screens/WorkoutDetailScreen.tsx` (Fully Implemented)
- [x] `src/screens/ProfileScreen.tsx` (Fully Implemented)

## Phase 7: App Entry
- [x] `App.tsx`
- [x] `index.js`

## Phase 8: Assets & Config
- [ ] Copy fonts/images from old project
- [ ] `android/` config tweaks (Skipped temporarily per user request)
