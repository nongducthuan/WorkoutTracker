# Migration: WorkoutTrackerFE Web → Expo React Native (PULSE Mobile)

## Tổng quan

Chuyển đổi frontend hiện tại từ **Vite + React + TailwindCSS** (web) sang **Expo React Native** (mobile app). Giao diện mới dựa theo file `PULSE Mobile.html` — dark-mode, accent màu xanh lá `#C6F432`, bottom tab navigation, mobile-first layout.

**Stack hiện tại (Web):**
- Vite + React 18 + TypeScript
- TailwindCSS
- react-router-dom (routing)
- @tanstack/react-query
- recharts (charts)
- lucide-react (icons)
- axios, react-hook-form, zod, i18next

**Stack mới (Mobile):**
- Expo SDK (React Native)
- Expo Router (file-based routing)
- NativeWind v4 ✅ (thay TailwindCSS — market leader, Expo endorsed, syntax quen thuộc)
- @tanstack/react-query (giữ nguyên)
- react-native-gifted-charts ✅ (thay recharts — đẹp, API đơn giản, phù hợp fitness dashboard)
- @expo/vector-icons (thay lucide-react)
- axios (giữ nguyên)
- react-hook-form + zod (giữ nguyên)
- i18next + react-i18next (giữ nguyên)
- expo-secure-store (thay localStorage)

---

## User Review Required

> [!IMPORTANT]
> **Tên thư mục app mới**: Plan này tạo thư mục `WorkoutTrackerMobile/` ngang hàng với `WorkoutTrackerFE/`. Nếu muốn tên khác, hãy chỉ định.

> [!WARNING]
> **localStorage → expo-secure-store**: Toàn bộ auth token và user data hiện lưu qua `localStorage` sẽ được migrate sang `expo-secure-store` + `AsyncStorage`. Cần review các file `api/auth.ts`, `api/client.ts`.

> [!IMPORTANT]
> **recharts không chạy trên React Native**. Cần chọn thư viện chart thay thế. Các lựa chọn:
> - `victory-native` (stable, nhiều chart type)
> - `react-native-gifted-charts` (đẹp, nhẹ)
> - `react-native-svg-charts` (custom cao)

> [!CAUTION]
> **Web API calls**: `window.location`, `localStorage`, `document.*` cần được thay thế hoàn toàn bằng các Expo/RN equivalents. Interceptor trong `api/client.ts` cần refactor.

---

## Open Questions

> [!IMPORTANT]
> 1. **Chart library**: Đã chọn `react-native-gifted-charts`.
> 2. **Styling**: Đã chọn **NativeWind**.
> [!NOTE]
> 3. **i18n**: ✅ Giữ nguyên. `i18next-http-backend` → `i18next-resources-to-backend` cho RN.
> 4. **Onboarding**: File `OnboardingWizard.tsx` có migrate không? *(chưa rõ)*
> 5. **Mock mode**: Giữ mock data (`mockDb.ts`) cho dev không? *(chưa rõ)*

---

## Design System (từ PULSE Mobile.html)

| Token | Value |
|-------|-------|
| Background | `#0B0C0E` |
| Card/Surface | `#141518` |
| Brand (electric) | `#C6F432` |
| Muted text | `#6B7280` |
| Orange accent | `#FF6B35` |
| Font | System font (`-apple-system`) |

**Navigation pattern**: Bottom Tab Bar (5 tabs: Dashboard, Workouts, Schedule, Exercises, Reports) + drawer/stack cho Profile & WorkoutDetail.

---

## Proposed Changes

### Phase 1 — Project Bootstrap

#### [NEW] `WorkoutTrackerMobile/` (Expo project)
- Khởi tạo bằng `npx create-expo-app@latest WorkoutTrackerMobile --template tabs`
- Cài dependencies: `@tanstack/react-query`, `axios`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `react-hook-form`, `zod`, `i18next`, `react-i18next`, `@hookform/resolvers`, chart library

---

### Phase 2 — Core Infrastructure

#### [NEW] `src/constants/theme.ts`
Design tokens từ PULSE Mobile: colors, spacing, typography, shadows.

#### [NEW] `src/api/client.ts`
Refactor từ web version:
- Bỏ `import.meta.env` → dùng `process.env` / `Constants.expoConfig`
- Bỏ `localStorage` → dùng `expo-secure-store`
- Bỏ `window.location.href` → dùng Expo Router `router.replace('/login')`

#### [NEW] `src/api/auth.ts`
Refactor:
- `localStorage.getItem/setItem/removeItem` → `SecureStore.getItemAsync/setItemAsync/deleteItemAsync`
- Giữ nguyên logic mock mode và backend API calls

#### [NEW] `src/api/workouts.ts`, `schedules.ts`, `exercises.ts`, `reports.ts`, `comments.ts`
Copy + refactor từ web (thay localStorage references).

#### [NEW] `src/api/mockDb.ts`
Copy nguyên từ web (không dùng browser APIs).

#### [NEW] `src/hooks/useFitnessData.ts`
Copy nguyên từ web (React Query hooks, không phụ thuộc browser).

#### [NEW] `src/types/index.ts`
Copy nguyên từ web (TypeScript interfaces thuần).

#### [NEW] `src/i18n.ts`
Refactor: bỏ `i18next-http-backend`, dùng inline resources hoặc `i18next-resources-to-backend`.

#### [NEW] `src/locales/vi.json`, `src/locales/en.json`
Copy nguyên từ web.

---

### Phase 3 — Navigation Setup

#### [NEW] `app/_layout.tsx`
Root layout với `QueryClientProvider`, `ToastProvider`, i18n init, auth guard.

#### [NEW] `app/(auth)/login.tsx`
Screen Login — migrate từ `pages/Login.tsx`.

#### [NEW] `app/(auth)/register.tsx`
Screen Register — migrate từ `pages/Register.tsx`.

#### [NEW] `app/(tabs)/_layout.tsx`
Bottom Tab Navigator với 5 tabs (icon + label):
- `index` → Dashboard (LayoutDashboard icon)
- `workouts` → Workouts (Dumbbell icon)
- `schedule` → Schedule (Calendar icon)
- `exercises` → Exercises (BookOpen icon)
- `reports` → Reports (BarChart3 icon)

Tab bar style: `#141518` background, `#C6F432` active tint.

#### [NEW] `app/(tabs)/index.tsx` (Dashboard)
#### [NEW] `app/(tabs)/workouts.tsx`
#### [NEW] `app/(tabs)/schedule.tsx`
#### [NEW] `app/(tabs)/exercises.tsx`
#### [NEW] `app/(tabs)/reports.tsx`
#### [NEW] `app/workouts/[id].tsx` (WorkoutDetail stack screen)
#### [NEW] `app/profile.tsx` (Profile stack screen)

---

### Phase 4 — Shared Components

#### [NEW] `src/components/Toast.tsx`
Dùng `react-native` `Animated` API thay DOM manipulation. Giữ `useToast` hook interface.

#### [NEW] `src/components/Modal.tsx`
Dùng RN `Modal` component thay HTML dialog.

#### [NEW] `src/components/ConfirmDialog.tsx`
Dùng RN `Alert.alert` hoặc custom Modal.

#### [NEW] `src/components/EmptyState.tsx`
Migrate với RN `View`, `Text`, `Image`.

#### [NEW] `src/components/LoadingSkeleton.tsx`
Dùng `Animated` API hoặc `expo-linear-gradient` cho shimmer effect.

#### [NEW] `src/components/MuscleMap.tsx`
Dùng `react-native-svg` thay inline SVG.

#### [NEW] `src/components/OnboardingWizard.tsx`
Migrate với RN `FlatList` hoặc `ScrollView` pager.

---

### Phase 5 — Screen Migration

| Web Page | Mobile Screen | Notes |
|----------|---------------|-------|
| `Login.tsx` | `app/(auth)/login.tsx` | `TextInput`, `KeyboardAvoidingView` |
| `Register.tsx` | `app/(auth)/register.tsx` | Multi-step form |
| `Dashboard.tsx` | `app/(tabs)/index.tsx` | `ScrollView`, stats cards |
| `Workouts.tsx` | `app/(tabs)/workouts.tsx` | `FlatList` thay list |
| `WorkoutDetail.tsx` | `app/workouts/[id].tsx` | Largest file, cần chia components |
| `Schedule.tsx` | `app/(tabs)/schedule.tsx` | Calendar view |
| `Exercises.tsx` | `app/(tabs)/exercises.tsx` | Search + filter |
| `Reports.tsx` | `app/(tabs)/reports.tsx` | Charts migration |
| `Profile.tsx` | `app/profile.tsx` | Form + settings |

**Các mapping component chính:**
| Web | React Native |
|-----|-------------|
| `div` | `View` |
| `span`, `p`, `h1-h6` | `Text` |
| `button` | `Pressable` / `TouchableOpacity` |
| `input` | `TextInput` |
| `img` | `Image` |
| `a` (link) | `Pressable` + `router.push()` |
| CSS classes | StyleSheet / NativeWind |
| `localStorage` | `expo-secure-store` / `AsyncStorage` |
| `react-router-dom` | `expo-router` |
| `recharts` | `victory-native` / `gifted-charts` |
| `lucide-react` | `@expo/vector-icons` |

---

### Phase 6 — Polish & Config

#### [NEW] `app.json` / `app.config.ts`
Expo config: app name, icon, splash screen, env vars.

#### [NEW] `assets/`
App icon, splash screen (PULSE branding, dark `#0B0C0E`, logo `#C6F432`).

#### [NEW] `eas.json`
EAS Build config cho development/preview/production.

---

## Verification Plan

### Automated Tests
```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint . --ext ts,tsx

# Start Expo dev server
npx expo start
```

### Manual Verification
1. Chạy trên iOS Simulator / Android Emulator qua Expo Go
2. Verify auth flow: Login → Home → Logout
3. Verify bottom tab navigation hoạt động đúng
4. Verify CRUD workouts
5. Verify charts hiển thị đúng trên Reports
6. Verify i18n toggle (VI/EN)
7. Verify dark theme (default) theo PULSE design
8. Test offline/mock mode
