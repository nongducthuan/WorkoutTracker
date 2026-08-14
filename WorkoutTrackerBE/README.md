# WorkoutTrackerBE (Node.js / Express / TypeScript / Prisma)

Dự án Backend cho ứng dụng Workout Tracker, được migrate từ mã nguồn .NET C# Clean Architecture sang **Express.js + TypeScript + Prisma ORM + MySQL**.

---

## 🛠️ Công Nghệ Sử Dụng

- **Runtime & Language**: Node.js, TypeScript
- **Framework**: Express.js
- **Database & ORM**: MySQL, Prisma ORM
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Token), bcrypt
- **Date Utilities**: `date-fns`
- **Containerization**: Docker (Multi-stage build)

---

## 📁 Cấu Trúc Dự Án (`src/`)

```text
WorkoutTrackerBE-node/
├── prisma/
│   └── schema.prisma        # Prisma Schema (Entities, Relations, Enums)
├── src/
│   ├── config/              # Cấu hình môi trường & Prisma Client
│   ├── dtos/                # Zod schemas cho Validation & DTO Types
│   ├── errors/              # Custom AppError & Error status codes
│   ├── repositories/        # Data Access Layer (Prisma Queries)
│   ├── services/            # Business Logic Layer
│   ├── controllers/         # Express Request/Response Controllers
│   ├── routes/              # Express Routers
│   ├── middlewares/         # Auth, Zod Validation, Global Error Handler
│   ├── utils/               # JWT Utilities, Passwords
│   ├── app.ts               # Express App Setup (Routes & Middleware wiring)
│   └── server.ts            # Entrypoint lắng nghe PORT
├── DECISIONS.md             # Tài liệu quyết định thiết kế & migration rules
├── Dockerfile               # Production Docker Multi-stage Build
└── package.json
```

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local Setup)

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Cấu hình Môi trường (.env)

Tạo file `.env` tại thư mục gốc `WorkoutTrackerBE-node/`:

Sao chép `.env.example` rồi điền. `DATABASE_URL` và `JWT_SECRET` là **bắt buộc** —
thiếu thì server ném lỗi ngay lúc khởi động thay vì chạy bằng secret mặc định.

```env
PORT=8080
DATABASE_URL="mysql://root:password@localhost:3306/workouttracker"
JWT_SECRET="sinh bằng: openssl rand -hex 32"

# Access token ngắn hạn vì không thu hồi được; refresh token mới là cái thu hồi được.
JWT_EXPIRES_IN="1h"
REFRESH_TOKEN_DAYS=30

# Bắt buộc khi NODE_ENV=production
CORS_ORIGINS="https://app.example.com"

# Bắt buộc khi NODE_ENV=production; thiếu (ở môi trường khác) thì mã OTP
# được in ra log thay vì gửi email.
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### 3. Khởi tạo Prisma & DB Migration

```bash
# Generate Prisma Client
npm run prisma:generate

# Chạy Migration (tạo bảng trong DB)
npm run prisma:migrate
```

### 4. Chạy Ứng Dụng

```bash
# Development mode (với hot-reload)
npm run dev

# Production build & start
npm run build
npm start
```

---

## 🐳 Running with Docker

### Build Docker Image:

```bash
docker build -t workout-tracker-be-node .
```

### Run Docker Container:

```bash
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL="mysql://user:pass@host.docker.internal:3306/workouttracker" \
  -e JWT_SECRET="your-secret-key" \
  --name workout-tracker-node \
  workout-tracker-be-node
```

### Healthcheck Endpoints:

```http
GET /health/live    # tiến trình còn sống — KHÔNG chạm DB
GET /health/ready   # sẵn sàng phục vụ — có ping DB, trả 503 nếu DB chết
```

Docker HEALTHCHECK dùng `/health/ready`: `/health/live` luôn trả `ok` kể cả khi
mất kết nối DB nên không bao giờ đánh dấu container hỏng.

---

## 📌 Danh Sách Endpoints API chính

Tài liệu đầy đủ, luôn khớp với code: **Swagger UI tại `/docs`**, JSON tại `/openapi.json`.
Bảng dưới chỉ là mục lục nhanh.

Tất cả các API ngoại trừ `/auth/login`, `/auth/register`, `/auth/refresh`, luồng quên
mật khẩu và health check đều yêu cầu Header: `Authorization: Bearer <ACCESS_TOKEN>`

**Định dạng lỗi.** Mọi lỗi trả về `{ "code": "OTP_EXPIRED", "message": "OtpExpired" }`.
Client nên rẽ nhánh theo `code` (ổn định), không theo `message` (chuỗi hiển thị).

| Group | Method | Path | Description |
|---|---|---|---|
| **Health** | `GET` | `/health/live` | Docker Healthcheck Endpoint |
| **Auth** | `POST` | `/auth/login` | Đăng nhập → `{ token, refreshToken, user }` |
| | `POST` | `/auth/register` | Đăng ký → `{ token, refreshToken, user }` |
| | `POST` | `/auth/refresh` | Đổi refresh token lấy cặp token mới (xoay vòng) |
| | `POST` | `/auth/logout` | Thu hồi refresh token (không gửi token → thu hồi mọi phiên) |
| | `GET` | `/auth/me` | Hồ sơ người dùng hiện tại |
| | `PUT` | `/auth/change-password` | Đổi mật khẩu (thu hồi mọi phiên khác) |
| | `PUT` | `/auth/profile` | Cập nhật hồ sơ (tên, email, cân nặng, chiều cao, ngày sinh, avatar) |
| | `POST` | `/auth/forgot-password` | Gửi mã OTP qua email |
| | `POST` | `/auth/verify-otp` | Đổi OTP lấy reset token |
| | `PUT` | `/auth/reset-password` | Đặt lại mật khẩu |
| **Me** | `GET` | `/me/settings` | Tuỳ chọn người dùng (tạo mặc định ở lần đọc đầu) |
| | `PUT` | `/me/settings` | Cập nhật tuỳ chọn (partial) |
| **Exercises** | `GET` | `/exercises` | Lấy danh mục bài tập (có search, pagination) |
| **Workouts** | `GET` | `/workouts` | Lấy danh sách Workout Plans của User |
| | `GET` | `/workouts/:id` | Lấy chi tiết 1 Workout Plan |
| | `POST` | `/workouts` | Tạo mới Workout Plan |
| | `PUT` | `/workouts/:id` | Cập nhật Workout Plan |
| | `DELETE` | `/workouts/:id` | Xóa Workout Plan |
| **Workout Exercises** | `GET` | `/workout-exercises/:workoutId` | Danh sách bài tập trong Plan |
| | `POST` | `/workout-exercises` | Thêm bài tập vào Plan |
| | `PUT` | `/workout-exercises/:id` | Sửa thông số bài tập (sets, reps, weight) |
| | `DELETE` | `/workout-exercises/:id` | Xóa bài tập khỏi Plan |
| **Schedule Workouts** | `GET` | `/workout-schedules` | Lịch tập của User (lọc `from`/`to`/`workoutId`/`isCompleted`) |
| | `GET` | `/workout-schedules/:id` | Chi tiết 1 lịch tập |
| | `GET` | `/workout-schedules/workout/:workoutId` | Lịch tập theo Workout Plan |
| | `POST` | `/workout-schedules` | Tạo lịch tập |
| | `PUT` | `/workout-schedules/:id` | Cập nhật ngày hẹn lịch tập |
| | `PUT` | `/workout-schedules/:id/complete` | Đánh dấu buổi tập hoàn thành (`isCompleted=true`) |
| | `DELETE` | `/workout-schedules/:id` | Hủy lịch tập |
| **Workout Comments** | `GET` | `/workout-comments/:workoutId` | Lấy danh sách bình luận |
| | `POST` | `/workout-comments` | Đăng bình luận |
| | `PUT` | `/workout-comments/:id` | Chỉnh sửa bình luận |
| | `DELETE` | `/workout-comments/:id` | Xóa bình luận |
| **Workout Sessions** | `GET` | `/workout-sessions` | Lịch sử buổi tập thực tế (lọc ngày, phân trang) |
| | `GET` | `/workout-sessions/:id` | Chi tiết buổi tập kèm từng hiệp |
| | `POST` | `/workout-sessions` | Bắt đầu buổi tập; kèm `sets` để ghi trọn buổi trong 1 request |
| | `PUT` | `/workout-sessions/:id/finish` | Kết thúc: ghi hiệp, tính volume, đánh dấu lịch hoàn thành |
| | `DELETE` | `/workout-sessions/:id` | Xoá buổi tập |
| **Reports** | `GET` | `/reports` | Thống kê tổng hợp + xu hướng 8 tuần |
| | `GET` | `/reports/personal-records` | PR mỗi động tác (tạ nặng nhất, 1RM ước tính Epley) |
| | `GET` | `/reports/muscle-load` | Tải cơ theo nhóm + theo động tác, tham số `?days=7` |

---

## 🏋️ Buổi tập thực tế (`WorkoutSession`)

`ScheduleWorkout.isCompleted` chỉ nói buổi tập **có diễn ra hay không**. Nó không
lưu tập bao lâu, làm được mấy hiệp, nâng bao nhiêu ký — nên mọi con số suy ra từ
nó đều dựa trên giả định "tập đúng y như kế hoạch".

`WorkoutSession` + `WorkoutSet` lưu cái đã thực sự xảy ra. Toàn bộ `/reports`,
PR và tải cơ đều tính từ đây.

**Tương thích ngược:** tài khoản chưa có buổi tập nào thì `/reports` tự quay về
cách tính cũ dựa trên lịch, và đánh dấu `source: "schedules"` để client biết đó
là số liệu ước lượng. Khi đã có buổi tập, `source` là `"sessions"`.

---

## 🔒 Bảo mật

- **Rate limit**: 600 req/15 phút toàn API; 5 lần/15 phút cho login, register,
  verify-otp, reset-password; 5 lần/giờ cho forgot-password.
- **Khoá OTP**: sai quá `OTP_MAX_ATTEMPTS` (mặc định 5) lần thì mã bị huỷ.
  OTP sinh bằng `crypto.randomInt` và so sánh theo thời gian hằng số.
- **Refresh token**: chỉ lưu SHA-256 trong DB, xoay vòng mỗi lần dùng, tự thu
  hồi khi đổi/đặt lại mật khẩu.
- **`helmet`**, giới hạn body `JSON_BODY_LIMIT`, và CORS **bắt buộc** whitelist
  qua `CORS_ORIGINS` khi `NODE_ENV=production`.
- **`JWT_SECRET` không có giá trị mặc định** — thiếu là server không khởi động.

---

## 🧪 Test

```bash
npm test              # watch
npm run test:run      # chạy 1 lượt
npm run test:coverage
npm run typecheck
```

Unit test dùng repository giả nên **không cần database**. Riêng
`tests/auth.flow.integration.test.ts` cần DB thật và chỉ chạy khi đặt
`RUN_INTEGRATION_TESTS=true` — để không ghi bậy vào DB đang dev. CI
(`.github/workflows/backend.yml`) dựng MySQL 8 rồi chạy typecheck → test → build.

---

## 📝 Logging

`pino` ghi log có cấu trúc, mỗi request một dòng kèm `x-request-id` (nhận từ
client nếu có, không thì tự sinh). Token, mật khẩu, OTP luôn bị che.
Xem log dễ đọc khi dev: `npm run dev | npx pino-pretty`.
