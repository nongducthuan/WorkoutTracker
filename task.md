# Task Checklist: Web → Expo Mobile Migration

## Phase 1 — Project Bootstrap

- `[x]` Khởi tạo Expo project: `npx create-expo-app@latest WorkoutTrackerMobile --template tabs`
- `[x]` Cài core dependencies: `@tanstack/react-query`, `axios`, `expo-secure-store`, `@react-native-async-storage/async-storage`
- `[x]` Cài form dependencies: `react-hook-form`, `zod`, `@hookform/resolvers`
- `[x]` Cài i18n: `i18next`, `react-i18next`
- `[x]` Cài chart library (`react-native-gifted-charts`)
- `[x]` Cài icons: `@expo/vector-icons` (đã có trong Expo)
- `[x]` Cài `react-native-svg` (cho MuscleMap + charts)
- `[x]` Cài `expo-linear-gradient` (cho shimmer skeleton + gradients)
- `[x]` Setup NativeWind v4 (`tailwind.config.js`, `global.css`, `babel.config.js`, `metro.config.js`)
- `[x]` Setup `.env` / `app.config.ts` với `EXPO_PUBLIC_API_BASE_URL`

---

## Phase 2 — Core Infrastructure

### Design System
- `[x]` Tạo `src/constants/theme.ts` — colors, spacing, typography, shadows (PULSE dark/light theme)
  - Dark mode (`#0B0C0E`), Card (`#141518`), Electric (`#C6F432`), Orange (`#FF6B35`)

### API Layer
- `[x]` Tạo `src/api/client.ts`
  - Bỏ `import.meta.env` → `process.env.EXPO_PUBLIC_*`
  - Bỏ `localStorage` → `expo-secure-store`
  - Bỏ `window.location.href` → Expo Router `router.replace()`
- `[x]` Tạo `src/api/auth.ts`
  - Thay `localStorage.*` → `SecureStore.getItemAsync/setItemAsync/deleteItemAsync`
- `[x]` Tạo `src/api/workouts.ts`
- `[x]` Tạo `src/api/schedules.ts`
- `[x]` Tạo `src/api/exercises.ts`
- `[x]` Tạo `src/api/reports.ts`
- `[x]` Tạo `src/api/comments.ts`
- `[x]` Tạo `src/api/mockDb.ts`

### Types & Hooks
- `[x]` Tạo `src/types/index.ts`
- `[x]` Tạo `src/hooks/useFitnessData.ts` (React Query hooks)

### i18n
- `[x]` Tạo `src/i18n.ts` — bundled JSON resources + SecureStore language persistence
- `[x]` Tạo `src/locales/vi.json`
- `[x]` Tạo `src/locales/en.json`

---

## Phase 3 — Navigation & Layout Setup

- `[x]` Tạo `app/_layout.tsx` — Root layout (QueryClientProvider, i18n, Auth Guard)
- `[x]` Tạo `app/(auth)/_layout.tsx` — Stack layout cho login/register
- `[x]` Tạo `app/(tabs)/_layout.tsx` — Bottom Tab Navigator:
  - 5 tabs: Dashboard, Workouts, Schedule, Exercises, Reports
  - Styling `#141518`, active tint `#C6F432`, Feather icons
- `[x]` Tạo `app/(auth)/login.tsx` (PULSE UI, authApi logic)
- `[x]` Tạo `app/(auth)/register.tsx` (PULSE UI, authApi logic)
- `[x]` Tạo `app/(tabs)/index.tsx` (Dashboard screen)
- `[x]` Tạo `app/(tabs)/workouts.tsx` (Workouts screen)
- `[x]` Tạo `app/(tabs)/schedule.tsx` (Schedule screen)
- `[x]` Tạo `app/(tabs)/exercises.tsx` (Exercises screen)
- `[x]` Tạo `app/(tabs)/reports.tsx` (Reports screen — `react-native-gifted-charts`)
- `[x]` Tạo `app/workouts/[id].tsx` — Stack screen WorkoutDetail / Studio
- `[x]` Tạo `app/profile.tsx` — Stack screen Profile (settings, theme, language)

---

## Phase 4 — Shared Components

- `[x]` **Modal.tsx** — Custom RN Modal với NativeWind styling & KeyboardAvoidingView
- `[x]` **ConfirmDialog.tsx** — Custom confirmation modal
- `[x]` **EmptyState.tsx** — Empty state layout với action button & icons
- `[x]` **LoadingSkeleton.tsx** — Activity indicator & skeleton placeholders
- `[x]` **MuscleMap.tsx** — Muscle map component placeholder / SVG support
- `[x]` **src/lib/muscleMap.ts** — Muscle group mappings & target muscle labels

---

## Phase 5 — Screen Migration Status

### Auth Screens
- `[x]` **Login screen** (`app/(auth)/login.tsx`)
- `[x]` **Register screen** (`app/(auth)/register.tsx`)

### Main Tabs
- `[x]` **Dashboard** (`app/(tabs)/index.tsx`)
  - Hero today's session, weekly stats, upcoming split, streak, tip banner
- `[x]` **Workouts** (`app/(tabs)/workouts.tsx`)
  - List of workouts, create/edit modal, delete confirmation, empty state
- `[x]` **Schedule** (`app/(tabs)/schedule.tsx`)
  - Month calendar view & list view toggle, reschedule modal, cancel schedule
- `[x]` **Exercises** (`app/(tabs)/exercises.tsx`)
  - Search input, category filter, muscle scanner, movement guide modal
- `[x]` **Reports** (`app/(tabs)/reports.tsx`)
  - Charts migration with `react-native-gifted-charts`
- `[x]` **WorkoutDetail** (`app/workouts/[id].tsx`)
  - Exercise sets logging, add exercise modal, comments section
- `[x]` **Profile** (`app/profile.tsx`)
  - Theme switcher (Light/Dark), language switcher (VI/EN), logout

---

## Phase 6 — Polish & Config

- `[x]` **app.json / app.config.ts** — App name "PULSE", bundle ID, version
- `[x]` **Splash screen** — Dark `#0B0C0E` với PULSE logo `#C6F432`
- `[x]` **expo-status-bar** — Light/Dark reactive status bar
- `[x]` Kiểm tra TypeScript (`npx tsc --noEmit`)

---

## Status Legend
- `[ ]` = Chưa bắt đầu
- `[/]` = Đang làm
- `[x]` = Hoàn thành
