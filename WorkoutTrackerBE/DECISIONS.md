# DECISIONS.md — WorkoutTrackerBE Node.js Migration

> Tài liệu tham chiếu cho AI/developer đọc trong conversation mới.
> **Đọc file này trước khi code bất kỳ module nào.**
> Source of truth: `Backend_Requirements.md` (ưu tiên 1) > Code C# gốc (ưu tiên 2).

---

## 1. Nguyên tắc chung

| Quyết định | Lý do |
|---|---|
| Response format: JSON thô, **không** bọc `{ success, data }` | Backend_Requirements.md đã chốt; bỏ `ApiResponse<T>` wrapper của C# gốc |
| Route **không** có prefix `/api/v1/` | Backend_Requirements.md: path phẳng `/auth`, `/exercises`, ... |
| Lỗi trả `{ "message": "ErrorCode" }` + HTTP status phù hợp | JSON thô nhất quán; không dùng message dài mô tả từ C# gốc |
| Message lỗi dùng **code ngắn enum-style** (VD: `"InvalidInputs"`, `"InvalidSets"`) | Backend_Requirements.md ưu tiên 1; nhất quán toàn project |
| Ownership fail → luôn trả **404** (`XxxNotFound`), **không** dùng 403 | Cố tình che giấu sự tồn tại resource thuộc user khác — đúng hành vi C# gốc |
| Input validation dùng **Zod** schema | Khai báo ở `src/dtos/*.dto.ts`; middleware `validate.ts` bắt ZodError |
| `userId` luôn lấy từ **JWT** (`req.user.sub`), **không** từ `req.body` | Nguyên tắc security cơ bản; C# lấy từ `ClaimsPrincipal` |
| Dùng `date-fns` cho mọi phép tính ngày/tuần trong Report | Chỉ định rõ trong task; tránh tự viết Date arithmetic dễ sai múi giờ |

---

## 2. Auth Module

| Quyết định | Lý do |
|---|---|
| **Thứ tự validate register**: input rỗng → email format → username trùng → email trùng | Đúng theo `AuthService.cs` gốc (C# L34→L39→L44 theo thứ tự) |
| Message lỗi: **`UserNameAlreadyExits`** (thiếu "s") — **⚠️ KHÔNG sửa chính tả** | Bug/typo cố ý giữ nguyên từ C# gốc; sửa sẽ break FE đang kiểm tra string này |
| JWT claims: `sub` (userId), `email`, `unique_name` (userName), `name` (fullName) | Backend_Requirements.md mục 2.1; FE decode JWT lấy các field này |
| Response `POST /auth/login` và `POST /auth/register`: **chỉ** `{ "token": "..." }` | Backend_Requirements.md; FE tự decode JWT, không cần object `user` riêng |
| Login tìm user theo `userName` HOẶC `email` (OR), case-insensitive | C# gốc: `GetByEmailAsync` hoặc `GetByUserNameAsync`; MySQL collation `_ci` xử lý |
| `POST /auth/login`: lỗi `"UserNameNotExist"` khi không tìm thấy, `"IncorrectPassword"` khi sai mật khẩu | **Hai message riêng biệt** — giữ đúng hành vi C# gốc dù tiết lộ enumeration |
| bcrypt cost factor: **10** | Task spec rõ ràng; không cần tương thích hash cũ (Identity PasswordHasher) |
| `PUT /auth/change-password` → response `{ "message": "Password updated successfully" }` | Không có trong Backend_Requirements.md; dùng format JSON thô đơn giản |
| `PUT /auth/profile` → response `{ "token": "..." }` (token mới sau khi update) | Cần token mới vì `email`/`name` trong JWT có thể thay đổi |
| **⚠️ Bug cố ý giữ nguyên (JWT Expiry)**: `JWT_EXPIRES_IN="7d"` cố định | Dù `appsettings.json` định nghĩa `ExpiryMinutes: 60`, nhưng `JwtOptions.cs` không bind field này và `JwtTokenGenerator.cs` (L40) lại hardcode `AddDays(7)`. Việc dùng `7d` ở Node là khớp hoàn toàn với behavior thực tế (hardcode) của hệ thống cũ. |

---

## 3. Exercise Module

| Quyết định | Lý do |
|---|---|
| `GET /exercises` **có** `requireAuth` middleware | C# `ExerciseController.cs` L14: `[Authorize]` ở class level |
| Endpoint **không** filter theo `userId` (danh mục dùng chung) | C# gốc: `GetAll()` không lọc userId; exercises là global catalog |
| Response shape: `{ data: [...], total, page, pageSize }` | Cần thêm pagination info; Backend_Requirements.md chỉ show array nhưng có yêu cầu pagination |
| `search` dùng Prisma `contains` **không** set `mode: "insensitive"` | MySQL dựa vào collation `_ci` của DB để xử lý case-insensitive; không phải Prisma setting |
| Default: `page=1`, `pageSize=10` | Backend_Requirements.md mục 6 |
| Field `difficulty` (enum: `Beginner`, `Intermediate`, `Advanced`) **bắt buộc có** | Yêu cầu mới từ Backend_Requirements.md — không có trong entity C# gốc nhưng phải thêm |

---

## 4. WorkoutPlan Module

| Quyết định | Lý do |
|---|---|
| `POST /workouts` → **201 Created** | Backend_Requirements.md ưu tiên 1; C# gốc trả 200 nhưng spec FE yêu cầu 201 |
| `GET /workouts` trả `scheduledDate` = **ngày gần nhất chưa hoàn thành** (`isCompleted=false`, sort ASC, take 1), `null` nếu không có | `WorkoutPlanResponseDto.cs` C# gốc có field `ScheduledDate` |
| Create: check trùng tên **case-insensitive** trong phạm vi user (không global unique) | C# L159: `ToLower()` comparison; trùng tên với user khác được phép |
| Update: check ownership TRƯỚC, rồi chỉ check tên nếu `plan.name !== dto.name` bằng **case-sensitive** `!==` | **⚠️ Inconsistency cố ý giữ nguyên**: Create dùng case-insensitive, Update dùng case-sensitive — đúng bug trong C# gốc L133 |
| Update check trùng tên: thêm `NOT: { id: planId }` để loại trừ chính plan đang sửa | Không tính plan đang sửa là "trùng tên với chính nó" |
| Race condition 2 plan trùng tên cùng lúc → **chấp nhận**, không thêm transaction/lock | Đúng hành vi C# gốc (chỉ dùng `AnyAsync()`, không có DB constraint); đồ án, không over-engineer |
| Delete dựa vào `onDelete: Cascade` trong Prisma schema | AppDbContextModelSnapshot.cs đã confirm cascade delete cho child tables |
| Ownership fail → `"WorkoutPlanNotFound"` (404) — không trả 403 | Ẩn sự tồn tại resource; đúng C# gốc |

---

## 5. WorkoutExercise Module

| Quyết định | Lý do |
|---|---|
| Validate: `sets > 0` → `"InvalidSets"`, `repetitions > 0` → `"InvalidRepetitions"`, `weight >= 0` → `"InvalidWeight"` | `WorkoutExerciseError.cs` C# gốc + backend_requirements.md |
| `DELETE /workout-exercises/:id` → **200 OK** (không phải 204) | C# `WorkoutExerciseController.cs` L64: `return Ok(...)` |
| Ownership check qua **parent WorkoutPlan** (`workout: { userId }`), không filter `userId` trực tiếp trên `workoutExercise` | C# gốc: `CheckAccess` filter `wp.Workout.UserId == userId` |
| Ownership fail → `"WorkoutExerciseNotFound"` (404) | Ẩn sự tồn tại; nhất quán với pattern toàn project |
| `GET /workout-exercises/:workoutId` join kèm `exerciseName` từ bảng `exercises` | Backend_Requirements.md mục 2.4 response shape |

---

## 6. ScheduleWorkout Module

| Quyết định | Lý do |
|---|---|
| Validate `scheduledDate >= today` áp dụng cho **cả POST và PUT** | C# gốc L85 và L108: cả `SetWorkoutSchedule` và `UpdateScheduledWorkout` đều check |
| So sánh ngày dùng `date-fns` `startOfDay()` theo **local time server** | C# gốc: `.ToLocalTime().Date < DateTime.Today` |
| `PUT /workout-schedules/:id/complete` — **bổ sung ngoài Backend_Requirements.md** | Tồn tại trong C# `ScheduleController.cs` L78; cần để Report module hoạt động (cập nhật `isCompleted = true`) |
| Endpoint `/complete` có **ownership check đầy đủ** trước khi update | C# gốc L138: filter `s.Id == id && s.Workout.UserId == userId` |
| `GET /workout-schedules` và `GET /workout-schedules/workout/:workoutId` — response kèm `workoutName` | Backend_Requirements.md mục 2.5 |
| Sort `GET /workout-schedules`: **ASC** theo `scheduledDate` | Backend_Requirements.md mục 2.5: "sắp xếp theo scheduledDate tăng dần" |
| `DELETE /workout-schedules/:id` → **200 OK** (không phải 204) | Nhất quán với C# gốc trả `Ok()` |

---

## 7. WorkoutComments Module

| Quyết định | Lý do |
|---|---|
| **⚠️ Bug cố ý giữ nguyên**: Update/Delete comment chỉ check `comment.workout.userId == userId` (chủ plan), **KHÔNG** check `comment.userId == userId` (tác giả) | C# `CheckAccess` L120: `wp.Workout.UserId == userId` — cột `UserId` được thêm ở migration sau nhưng `CheckAccess` chưa sửa. Nghĩa là: **chủ WorkoutPlan có quyền sửa/xóa mọi comment trên plan của mình, kể cả comment người khác viết** |
| Backend_Requirements.md mục 3.1 (đề xuất "thêm cột UserId") → **LỖI THỜI, không áp dụng** | Entity `WorkoutComments.cs` thực tế đã có `UserId`/`User` navigation property từ migration `AddUserIdToWorkoutComments` |
| `createdAt` map từ cột `Date` trong DB | Backend_Requirements.md mục 3.2; cột trong C# entity tên `Date`, JSON field tên `createdAt` |
| Sort `GET /workout-comments/:workoutId`: **DESC** theo `createdAt` | Backend_Requirements.md mục 2.6: "Sắp xếp bình luận mới nhất lên đầu" |
| `userName` lấy từ `User.fullName` (join bảng `users` qua `userId`) | Backend_Requirements.md mục 2.6 response shape: `"userName": "User Full Name"` |
| `GET /workout-comments/:workoutId` có ownership check qua **WorkoutPlan** | C# gốc L80: `_workoutPlanService.CheckAccess(workoutId, userId)` |
| `POST /workout-comments` → **201 Created** | Backend_Requirements.md ưu tiên; response kèm đầy đủ `userName`, `userId`, `createdAt` |

---

## 8. Report Module

> **Nguồn logic gốc**: `Workout.Infrastructure/Repository/WorkoutPlansRepository.cs` — hàm `GenerateReport(Guid userId)` L17–L107. Không có file `ReportService.cs` hay `ReportRepository.cs` riêng trong C# gốc; logic nằm trực tiếp trong `WorkoutPlansRepository`.

| Quyết định | Ghi chú |
|---|---|
| Nguồn dữ liệu: `ScheduleWorkout` WHERE `workout.userId == userId` AND `isCompleted == true`, eagerly load `workout.workoutExercises` | Port từ `WorkoutPlansRepository.cs` L19–L23 |
| `totalWorkouts` = COUNT bản ghi schedule đã lọc | — |
| **⚠️ Bug cố ý giữ nguyên**: `totalVolume` cộng dồn `sets*reps*weight` theo **số lần schedule xuất hiện**, không dedupe theo plan | Nếu 1 WorkoutPlan có 5 lần schedule đã hoàn thành, volume tính nhân 5 — đúng hành vi C# gốc `L32–L34`, không sửa |
| `recentActivity`: sort DESC, **lấy tối đa 5 bản ghi** | Backend_Requirements.md chốt khác C# gốc (C# gốc trả toàn bộ) |
| `recentActivity` item shape: `{ id, date: scheduledDate, workoutName, exercisesCount }` | Backend_Requirements.md mục 2.7 |
| `weeklyWorkouts`: group theo **ISO 8601 week** (dùng `date-fns` `getISOWeek`), **lấy tối đa 4 tuần gần nhất** | Backend_Requirements.md chốt khác C# gốc; `getISOWeek` tương đương `.NET` `GetWeekOfYear(FirstFourDayWeek, Monday)` |
| `weeklyWorkouts` format tên tuần: **`"W{số}"`** (VD: `"W22"`) — **KHÔNG** đổi thành `"Wk 22"` | Giữ theo C# gốc; Backend_Requirements.md chỉ là ví dụ minh hoạ, không phải rule bắt buộc |
| **`weeklyWorkouts` sort: NUMERIC ISO week number — KHÔNG giữ string-sort bug C# gốc** | C# gốc dùng `.OrderBy(w => w.Week)` sort string → `"W1" < "W10" < "W2"` (sai chronological). Bug này là hệ quả tình cờ của việc sort field string `"W{n}"`, không phải rule nghiệp vụ cố ý. Vì đã đổi sang `date-fns getISOWeek()` + giới hạn 4 tuần, thứ tự phải đúng chronological. **Thứ tự xử lý**: group theo `weekNumber` (số) → sort DESC numeric → take 4 → sort ASC numeric → format `"W{n}"` chỉ ở bước cuối khi build response |
| `workoutsThisWeek`: đếm schedule có `scheduledDate` trong `[startOfWeek(now, {weekStartsOn:1}), today]` | Dùng `date-fns` `startOfWeek` với `weekStartsOn: 1` (Monday) — đã handle đúng edge case Sunday |
| `streakDays`: dừng **ngay khi** gặp gap > 1 ngày (break), không bỏ qua gap rồi tính tiếp | C# gốc `L84–L94` logic; dùng `date-fns` `isSameDay`, `subDays` |
| **Timezone cho `streakDays` và `workoutsThisWeek`: dùng local timezone của Node process** | Chấp nhận server local time; không xử lý theo timezone client (đồ án, không over-engineer). **⚠️ Nếu deploy Docker**: set `ENV TZ=Asia/Ho_Chi_Minh` (hoặc timezone mong muốn) trong Dockerfile để tránh sai lệch |
| Nếu không có dữ liệu → trả object default tất cả = 0/`[]` (KHÔNG trả lỗi, KHÔNG trả null) | C# gốc `L25–L28`; tránh FE crash |

---

## 9. Database Schema

### Cascade Delete (từ `AppDbContextModelSnapshot.cs`)

| Quan hệ | OnDelete |
|---|---|
| `WorkoutPlan` → `User` (FK: `userId`) | **Cascade** (L369) |
| `WorkoutExercise` → `WorkoutPlan` (FK: `workoutId`) | **Cascade** (L356) |
| `WorkoutExercise` → `Exercise` (FK: `exerciseId`) | **Cascade** (L350) |
| `ScheduleWorkout` → `WorkoutPlan` (FK: `workoutId`) | **Cascade** (L320) |
| `WorkoutComment` → `WorkoutPlan` (FK: `workoutId`) | **Cascade** (L337) |
| `WorkoutComment` → `User` (FK: `userId`) | **Restrict** (L331) |

### Indexes (từ `InitialCreate.cs` + `AddUserIdToWorkoutComments.cs` + `AddPerformanceIndexes.cs`)

| Bảng | Tên Index | Cột |
|---|---|---|
| `workoutPlans` | `IX_WorkoutPlans_UserId` | `userId` |
| `workoutExercises` | `IX_WorkoutExercises_ExerciseId` | `exerciseId` |
| `workoutExercises` | `IX_WorkoutExercises_WorkoutId` | `workoutId` |
| `scheduleWorkouts` | `IX_ScheduleWorkouts_WorkoutId` | `workoutId` |
| `scheduleWorkouts` | `IX_ScheduleWorkouts_ScheduledDate` | `scheduledDate` |
| `workoutComments` | `IX_WorkoutComments_WorkoutId` | `workoutId` |
| `workoutComments` | `IX_WorkoutComments_UserId` | `userId` |

### Collation & Type Mapping

| Quyết định | Lý do |
|---|---|
| DB collation: `utf8mb4_unicode_ci` (hoặc `_0900_ai_ci` nếu MySQL 8) | Case-insensitive comparison cho email/username ở tầng DB; tránh `.toLowerCase()` thủ công trong mọi query |
| UUID fields: `String @db.Char(36) @default(uuid())` | Prisma + MySQL: không có native UUID type; Char(36) lưu dạng text |
| `Exercise.id`: `Int @id @default(autoincrement())` | Entity C# gốc dùng `int`, không phải Guid |
| `WorkoutComment.createdAt`: `@map("Date")` | Tên cột thật trong DB là `Date`; Prisma field tên `createdAt` |

---

## 10. File Structure

```
WorkoutTrackerBE-node/
├── prisma/schema.prisma        ← Schema đã ký duyệt, KHÔNG sửa không hỏi
├── src/
│   ├── config/env.ts           ← JWT config, port
│   ├── config/prisma.ts        ← PrismaClient singleton
│   ├── dtos/                   ← Zod schemas (input validation)
│   ├── repositories/           ← Prisma queries (data access)
│   ├── services/               ← Business logic
│   ├── controllers/            ← HTTP layer (req/res)
│   ├── routes/                 ← Router mounting
│   ├── middlewares/
│   │   ├── auth.middleware.ts      ← requireAuth (verify JWT + uuid check)
│   │   ├── validate.middleware.ts  ← Zod validation middleware
│   │   └── errorHandler.middleware.ts ← Centralized error → JSON response
│   ├── errors/appError.ts      ← AppError(message, statusCode)
│   └── utils/jwt.util.ts       ← generateToken / verifyToken
```

## 11. Modules Status

| Module | Files | Compile |
|---|---|---|
| Auth | dtos ✅ repo ✅ service ✅ ctrl ✅ route ✅ | ✅ 0 errors |
| Exercise | dtos ✅ repo ✅ service ✅ ctrl ✅ route ✅ | ✅ 0 errors |
| WorkoutPlan | dtos ✅ repo ✅ service ✅ ctrl ✅ route ✅ | ✅ 0 errors |
| WorkoutExercise | dtos ✅ repo ✅ service ✅ ctrl ✅ route ✅ | ✅ 0 errors |
| ScheduleWorkout | dtos ✅ repo ✅ service ✅ ctrl ✅ route ✅ | ✅ 0 errors |
| WorkoutComment | dtos ✅ repo ✅ service ✅ ctrl ✅ route ✅ | ✅ 0 errors |
| **Report** | repo ✅ service ✅ ctrl ✅ route ✅ | ✅ 0 errors |
| app.ts + server.ts | ✅ ĐÃ LÀM | ✅ 0 errors |
| Middleware wiring | ✅ ĐÃ LÀM | ✅ 0 errors |
| README.md | ✅ ĐÃ LÀM | — |
| Dockerfile | ✅ ĐÃ LÀM | — |

---

## 12. Deployment & Build

| Quyết định | Lý do |
|---|---|
| **Build Script**: `package.json` script `build` phải là `"npx prisma generate && tsc"` | Bắt buộc chạy Prisma generate **trước** khi compile TypeScript (`tsc`) để tránh lỗi type missing khi ai đó gọi trực tiếp `npm run build`. |
| **Docker `TZ`**: Set `ENV TZ=Asia/Ho_Chi_Minh` | Đây là một **giả định**: Server .NET gốc không set timezone cứng nên sẽ ăn theo giờ của máy host. Do là đồ án chạy ở Việt Nam, máy host chắc chắn dùng múi giờ VN. Do đó set cứng `TZ` trong Dockerfile để tái tạo lại đúng behavior gốc, tránh sai lệch về ngày tháng cho `streakDays`. |
