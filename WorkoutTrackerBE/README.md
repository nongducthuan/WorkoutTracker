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

```env
PORT=8080
DATABASE_URL="mysql://root:password@localhost:3306/workouttracker"
JWT_SECRET="super-secret-jwt-key-workout-tracker"
JWT_EXPIRES_IN="7d"
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

### Healthcheck Endpoint:

```http
GET /health/live
```
Response: `{"status": "ok"}` (HTTP 200)

---

## 📌 Danh Sách Endpoints API chính

Tất cả các API ngoại trừ `/auth/login`, `/auth/register`, và `/health/live` đều yêu cầu Header:
`Authorization: Bearer <JWT_TOKEN>`

| Group | Method | Path | Description |
|---|---|---|---|
| **Health** | `GET` | `/health/live` | Docker Healthcheck Endpoint |
| **Auth** | `POST` | `/auth/login` | Đăng nhập (trả `{ token }`) |
| | `POST` | `/auth/register` | Đăng ký (trả `{ token }`) |
| | `PUT` | `/auth/change-password` | Đổi mật khẩu |
| | `PUT` | `/auth/profile` | Cập nhật thông tin tài khoản |
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
| **Schedule Workouts** | `GET` | `/workout-schedules` | Lịch tập của User |
| | `GET` | `/workout-schedules/workout/:workoutId` | Lịch tập theo Workout Plan |
| | `POST` | `/workout-schedules` | Tạo lịch tập |
| | `PUT` | `/workout-schedules/:id` | Cập nhật ngày hẹn lịch tập |
| | `PUT` | `/workout-schedules/:id/complete` | Đánh dấu buổi tập hoàn thành (`isCompleted=true`) |
| | `DELETE` | `/workout-schedules/:id` | Hủy lịch tập |
| **Workout Comments** | `GET` | `/workout-comments/:workoutId` | Lấy danh sách bình luận |
| | `POST` | `/workout-comments` | Đăng bình luận |
| | `PUT` | `/workout-comments/:id` | Chỉnh sửa bình luận |
| | `DELETE` | `/workout-comments/:id` | Xóa bình luận |
| **Reports** | `GET` | `/reports` | Lấy thống kê tổng hợp (Volume, Streak, Recent Activity...) |
