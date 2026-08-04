# Báo Cáo Kiểm Tra API Tương Thích FE ↔ BE

> Phân tích dựa trên FE: `WorkoutTrackerFE/src/api/` và BE: `WorkoutTrackerBE/src/`

---

## 🔴 Lỗi Nghiêm Trọng (Critical Mismatches)

### 1. Auth — Login / Register / UpdateProfile: Thiếu `user` trong response

| | FE Expects | BE Returns |
|---|---|---|
| `POST /auth/login` | `{ token: string, user: any }` | `{ token: string }` ❌ |
| `POST /auth/register` | raw `string` (message) | `{ token: string }` ❌ |
| `PUT /auth/profile` | `{ token: string, user: any }` | `{ token: string }` ❌ |

**Tác động:**
- `login()`: FE lưu `pulse_user` vào SecureStore từ `response.data.user` → sẽ lưu `undefined`
- `register()`: FE coi response là string → xử lý sai hoàn toàn
- `updateProfile()`: FE không cập nhật được user info sau khi đổi profile

**Fix:** BE cần trả về `{ token, user: { id, fullName, email, userName } }` hoặc FE cần decode JWT để lấy user info.

---

### 2. Exercises — Pagination mismatch

| | FE Expects | BE Returns |
|---|---|---|
| `GET /exercises` | `Exercise[]` (mảng trực tiếp) | `{ data: Exercise[], total, page, pageSize }` ❌ |

**Tác động:** FE sẽ nhận object thay vì array → `map()` bị lỗi → màn hình Exercises crash.

**Fix:** FE cần đọc `response.data.data` (unwrap paginated response), hoặc BE thêm option trả về flat array không phân trang.

---

### 3. WorkoutPlan Update — Required fields mismatch

| | FE Sends | BE Validates (Zod) |
|---|---|---|
| `PUT /workouts/:id` | `Partial<Workout>` (name?, description?) | cả `name` AND `description` đều **required** ❌ |

**Tác động:** Nếu FE chỉ gửi một trong hai field (e.g. chỉ `name`) → BE trả `400 InvalidInputs`.

**Fix:** BE cần đổi sang `partial()` trong Zod schema, hoặc FE luôn gửi cả hai fields.

---

### 4. WorkoutExercise Update — Required fields mismatch

| | FE Sends | BE Validates (Zod) |
|---|---|---|
| `PUT /workout-exercises/:id` | `Partial<WorkoutExercise>` | `sets`, `repetitions`, `weight` đều **required** ❌ |

**Tác động:** FE có thể gửi partial update → BE trả `400`.

**Fix:** Cùng hướng xử lý như #3 ở trên.

---

## 🟡 Cảnh Báo (Warnings)

### 5. Schedule Update — Nil UUID workaround

| | Chi tiết |
|---|---|
| **FE** | `update(id, date, workoutId?)` → nếu `workoutId` không truyền, dùng `'00000000-0000-0000-0000-000000000000'` |
| **BE** | `workoutId` trong UpdateScheduleWorkoutSchema là **optional** |

**Tác động:** Nếu FE gửi nil UUID, BE sẽ tìm WorkoutPlan theo UUID đó → có thể trả `404 WorkoutPlanNotFound`.

**Fix:** FE không nên gửi `workoutId` nếu không có, thay vì gửi nil UUID. Đổi thành chỉ gửi `{ scheduledDate }`.

---

### 6. Response Envelope Interceptor — Không match

FE `client.ts` có interceptor unwrap `{ success: boolean, data: T }`:
```ts
if (body && 'success' in body && 'data' in body) {
  response.data = body.data; // unwrap
}
```

**BE KHÔNG dùng envelope này** — BE trả data trực tiếp. Nên interceptor sẽ không kích hoạt cho hầu hết responses (vô hại, nhưng dư thừa).

**Ngoại lệ nguy hiểm**: `GET /exercises` trả `{ data: [...], total, page, pageSize }` — có key `data` nhưng không có key `success` → interceptor **không** unwrap → FE nhận nguyên object (lỗi #2).

---

### 7. Comments — `date` vs `createdAt` field name

| | FE Type (`WorkoutComment`) | BE Response (`WorkoutCommentResponse`) |
|---|---|---|
| Ngày tạo | `date?: string` AND `createdAt?: string` | chỉ có `createdAt: Date` |

**Tác động:** FE dùng `date` field ở một số chỗ sẽ luôn `undefined` khi dùng dữ liệu từ BE.

**Fix:** FE nên thống nhất chỉ dùng `createdAt`, bỏ field `date`.

---

### 8. Login — `email` vs `userName` parameter naming

FE: `login(email: string, password: string)` → gửi `{ userName: email, password }`

**Tác động:** Tên tham số gây nhầm lẫn — nếu user nhập email thật (`user@example.com`) thay vì username, BE sẽ tìm theo `userName` không phải `email` → `UserNameNotExist`.

**Fix:** UI login screen cần label rõ là "Username" (không phải Email), hoặc FE/BE hỗ trợ login bằng cả hai.

---

## ✅ Tương Thích Tốt (Compatible)

| Endpoint | Trạng thái |
|----------|-----------|
| `POST /auth/login` — request body | ✅ `{ userName, password }` khớp |
| `POST /auth/register` — request body | ✅ `{ fullName, userName, email, password }` khớp |
| `PUT /auth/change-password` | ✅ Request + Response khớp |
| `GET /workouts` | ✅ Array `Workout[]` với `scheduledDate` |
| `GET /workouts/:id` | ✅ (BE trả thêm `userId` — FE bỏ qua, OK) |
| `POST /workouts` | ✅ Request body khớp |
| `DELETE /workouts/:id` | ✅ FE ignore response body |
| `GET /workout-exercises/:workoutId` | ✅ `WorkoutExerciseWithExerciseName[]` |
| `POST /workout-exercises` | ✅ Request + Response khớp |
| `DELETE /workout-exercises/:id` | ✅ |
| `GET /workout-schedules` | ✅ `WorkoutScheduleWithWorkoutName[]` |
| `GET /workout-schedules/workout/:id` | ✅ |
| `POST /workout-schedules` | ✅ Request + Response khớp |
| `DELETE /workout-schedules/:id` | ✅ |
| `PUT /workout-schedules/:id/complete` | ✅ |
| `GET /workout-comments/:workoutId` | ✅ |
| `POST /workout-comments` | ✅ Request body khớp |
| `PUT /workout-comments/:id` | ✅ Request body `{ comment }` khớp |
| `DELETE /workout-comments/:id` | ✅ |
| `GET /reports` | ✅ `ReportStats` shape khớp hoàn toàn |

---

## 📋 Tóm Tắt Fix Ưu Tiên

| # | Mức độ | Vị trí | Fix | Trạng thái |
|---|--------|--------|-----|------------|
| 1 | 🔴 Critical | BE `auth.controller.ts` login/register/profile | Trả về `{ token, user: { id, fullName, email, userName } }` | ✅ Đã Fix |
| 2 | 🔴 Critical | FE `exercises.ts` | Đọc `response.data.data` (unwrap paginated) | ✅ Đã Fix |
| 3 | 🔴 Critical | BE `workoutPlan.dto.ts` | Đổi UpdateSchema sang `.partial()` | ✅ Đã Fix |
| 4 | 🔴 Critical | BE `workoutExercise.dto.ts` | Đổi UpdateSchema `sets/reps/weight` sang optional | ✅ Đã Fix |
| 5 | 🟡 Warning | FE `schedules.ts` update() | Không gửi `workoutId` nếu undefined | ✅ Đã Fix |
| 6 | 🟡 Warning | FE `types/index.ts` `WorkoutComment` | Xóa field `date`, chỉ dùng `createdAt` | ✅ Đã Fix |
| 7 | 🟡 Warning | FE login screen label | Cập nhật state nội bộ thành `identifier` | ✅ Đã Fix |
