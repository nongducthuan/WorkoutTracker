# WorkoutTrackerBE

Backend cho ứng dụng **Workout Tracker**, được migrate từ mã nguồn **.NET C# Clean Architecture** sang:

* **Node.js**
* **TypeScript**
* **Express.js**
* **Prisma ORM**
* **MySQL**

Project giữ nguyên các nguyên tắc domain/business logic quan trọng từ phiên bản .NET, đồng thời tổ chức lại Data Access và HTTP layer theo cách phù hợp với Express + TypeScript.

---

## 🛠️ Công nghệ sử dụng

| Thành phần        | Công nghệ                |
| ----------------- | ------------------------ |
| Runtime           | Node.js                  |
| Language          | TypeScript               |
| Framework         | Express.js               |
| Database          | MySQL 8+                 |
| ORM               | Prisma                   |
| Validation        | Zod                      |
| Authentication    | JWT + bcrypt             |
| Date utilities    | date-fns                 |
| Logging           | Pino                     |
| API Documentation | OpenAPI + Swagger UI     |
| Testing           | Vitest                   |
| Containerization  | Docker Multi-stage Build |

---

## 📁 Cấu trúc dự án

```text
WorkoutTrackerBE-node/
├── prisma/
│   └── schema.prisma              # Prisma schema, entities, relations, enums
│
├── src/
│   ├── config/                    # Environment config & Prisma Client
│   ├── dtos/                      # Zod schemas & DTO types
│   ├── errors/                    # AppError & application error codes
│   ├── repositories/              # Data Access Layer / Prisma queries
│   ├── services/                  # Business Logic Layer
│   ├── controllers/               # Express request/response handlers
│   ├── routes/                    # Express routers
│   ├── middlewares/               # Auth, validation, error handling, etc.
│   ├── utils/                     # JWT, password, token utilities
│   ├── app.ts                     # Express app configuration
│   └── server.ts                  # Application entrypoint
│
├── tests/
│   ├── *.test.ts                  # Unit tests
│   └── auth.flow.integration.test.ts
│
├── .env.example                   # Environment variable template
├── DECISIONS.md                   # Architecture & migration decisions
├── Dockerfile                     # Production multi-stage Docker build
├── package.json
└── tsconfig.json
```

---

## 🏗️ Architecture

Project sử dụng layered architecture, kế thừa tư duy Clean Architecture từ phiên bản .NET:

```text
HTTP Request
     │
     ▼
┌─────────────┐
│    Route    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Middleware  │
│ Auth / Zod  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │
│ Business    │
│   Logic     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │
│ Data Access │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Prisma    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    MySQL    │
└─────────────┘
```

### Responsibility

**Route**

* Khai báo HTTP method/path.
* Gắn middleware.
* Kết nối route với controller.

**Middleware**

* Authentication.
* Request validation.
* Rate limiting.
* Error handling.
* Request ID.
* Security headers.

**Controller**

* Đọc request.
* Gọi service.
* Trả HTTP response.
* Không chứa business logic phức tạp.

**Service**

* Chứa business rules.
* Kiểm tra ownership/authorization.
* Điều phối nhiều repository.
* Xử lý transaction khi cần.

**Repository**

* Chỉ chịu trách nhiệm Data Access.
* Thực hiện Prisma queries.
* Không chứa HTTP logic.

---

## 🧩 Domain Model

Workout Tracker phân biệt rõ giữa **kế hoạch**, **lịch dự kiến** và **buổi tập thực tế**.

```text
WorkoutPlan
    │
    └── WorkoutExercise
            │
            └── Exercise

WorkoutPlan
    │
    └── ScheduleWorkout
            │
            └── WorkoutSession
                    │
                    └── WorkoutSet
```

### WorkoutPlan

Kế hoạch tập của user.

Ví dụ:

```text
Push Day
- Bench Press
- Incline Dumbbell Press
- Shoulder Press
```

### WorkoutExercise

Một bài tập nằm trong WorkoutPlan, bao gồm các thông số kế hoạch như:

* Sets
* Reps
* Weight
* Order

### ScheduleWorkout

Lịch dự kiến user sẽ tập một WorkoutPlan vào một ngày cụ thể.

`isCompleted` chỉ thể hiện lịch đã được đánh dấu hoàn thành. Nó **không chứa dữ liệu chi tiết về những gì thực sự đã xảy ra trong buổi tập**.

### WorkoutSession

Buổi tập thực tế đã diễn ra.

Đây là nguồn dữ liệu chính cho:

* Workout history
* Reports
* Personal records
* Volume
* Muscle load

### WorkoutSet

Một hiệp thực tế trong WorkoutSession.

Có thể chứa:

* Exercise
* Set number
* Reps
* Weight
* Volume

---

# 🚀 Local Setup

## 1. Prerequisites

Cần cài đặt:

* Node.js 20+
* npm
* MySQL 8+
* Git

Kiểm tra:

```bash
node --version
npm --version
mysql --version
```

---

## 2. Install dependencies

Clone project và cài dependencies:

```bash
npm install
```

---

## 3. Configure environment

Tạo file `.env` tại thư mục root:

```text
WorkoutTrackerBE-node/
├── .env
├── package.json
├── prisma/
└── src/
```

Có thể copy từ `.env.example`:

```bash
cp .env.example .env
```

### Example `.env`

```env
PORT=8080

DATABASE_URL="mysql://root:password@localhost:3306/workouttracker"

JWT_SECRET="generate-with-openssl"

JWT_EXPIRES_IN="1h"

REFRESH_TOKEN_DAYS=30

# Required in production
CORS_ORIGINS="https://app.example.com"

# SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

Generate JWT secret:

```bash
openssl rand -hex 32
```

### Required environment variables

| Variable             |   Required | Default | Description             |
| -------------------- | ---------: | ------- | ----------------------- |
| `PORT`               |         No | `8080`  | HTTP server port        |
| `DATABASE_URL`       |        Yes | —       | MySQL connection string |
| `JWT_SECRET`         |        Yes | —       | Secret used to sign JWT |
| `JWT_EXPIRES_IN`     |         No | `1h`    | Access token lifetime   |
| `REFRESH_TOKEN_DAYS` |         No | `30`    | Refresh token lifetime  |
| `CORS_ORIGINS`       | Production | —       | Allowed CORS origins    |
| `SMTP_HOST`          | Production | —       | SMTP server             |
| `SMTP_PORT`          |         No | `587`   | SMTP port               |
| `SMTP_USER`          | Production | —       | SMTP username           |
| `SMTP_PASS`          | Production | —       | SMTP password           |

> `JWT_SECRET` và `DATABASE_URL` không có giá trị mặc định. Nếu thiếu, server sẽ fail fast thay vì chạy với configuration không an toàn.

### CORS

Trong production, `CORS_ORIGINS` phải được cấu hình rõ ràng.

Một origin:

```env
CORS_ORIGINS="https://app.example.com"
```

Nhiều origins:

```env
CORS_ORIGINS="https://app.example.com,https://admin.example.com"
```

Application phải parse danh sách này và chỉ whitelist các origin đã khai báo.

---

# 🗄️ Database & Prisma

## Generate Prisma Client

```bash
npm run prisma:generate
```

## Development migration

Khi phát triển local:

```bash
npm run prisma:migrate
```

Script này nên tương ứng với:

```bash
npx prisma migrate dev
```

Sau khi thay đổi `schema.prisma`, tạo migration mới bằng command trên.

---

## Production migration

Production **không sử dụng `prisma migrate dev`**.

Dùng:

```bash
npx prisma migrate deploy
```

Ví dụ:

```bash
npm run build
npx prisma migrate deploy
npm start
```

`migrate deploy` chỉ apply các migration đã tồn tại và phù hợp cho CI/CD hoặc production deployment.

---

## Prisma Studio

Nếu project có script tương ứng:

```bash
npx prisma studio
```

Prisma Studio cho phép inspect dữ liệu database trong quá trình development.

---

# ▶️ Running the application

## Development

```bash
npm run dev
```

Development mode hỗ trợ hot reload.

---

## Production

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

Thông thường flow production:

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run build
npm start
```

---

# 🐳 Docker

## Build image

```bash
docker build -t workout-tracker-be-node .
```

## Run container

Nếu MySQL chạy trực tiếp trên host:

```bash
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL="mysql://user:pass@host.docker.internal:3306/workouttracker" \
  -e JWT_SECRET="your-secret-key" \
  --name workout-tracker-node \
  workout-tracker-be-node
```

`host.docker.internal` phù hợp khi database chạy trên host machine và Docker runtime hỗ trợ hostname này.

---

## Docker Compose

Nếu MySQL cũng chạy bằng Docker Compose, backend nên kết nối tới MySQL bằng **service name**, ví dụ:

```env
DATABASE_URL="mysql://user:pass@mysql:3306/workouttracker"
```

Không dùng `localhost` giữa các container.

Ví dụ:

```text
backend container
      │
      │ mysql:3306
      ▼
mysql container
```

---

# ❤️ Health Checks

Application cung cấp hai health endpoints.

## Liveness

```http
GET /health/live
```

Response:

```json
{
  "status": "ok"
}
```

Endpoint này:

* Không truy cập database.
* Chỉ xác nhận process đang chạy.
* Không nên fail chỉ vì database đang unavailable.

---

## Readiness

```http
GET /health/ready
```

Endpoint này kiểm tra:

* Application đang chạy.
* Database có thể kết nối.

Nếu database unavailable, endpoint trả:

```http
503 Service Unavailable
```

Docker healthcheck sử dụng `/health/ready`.

Mục đích:

```text
/health/live
    ↓
Process có sống không?

/health/ready
    ↓
Application đã sẵn sàng nhận traffic chưa?
```

---

# 📚 API Documentation

Sau khi application chạy:

### Swagger UI

```text
http://localhost:8080/docs
```

### OpenAPI JSON

```text
http://localhost:8080/openapi.json
```

Swagger/OpenAPI là nguồn tài liệu API chính và nên được giữ đồng bộ với implementation.

---

# 🔐 Authentication

Authentication sử dụng:

* JWT access token.
* Refresh token.
* bcrypt password hashing.
* SHA-256 hash cho refresh token trong database.

Client gửi access token:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

## Authentication matrix

| Endpoint                | Authentication |
| ----------------------- | -------------- |
| `/health/live`          | Public         |
| `/health/ready`         | Public         |
| `/auth/login`           | Public         |
| `/auth/register`        | Public         |
| `/auth/refresh`         | Refresh token  |
| `/auth/forgot-password` | Public         |
| `/auth/verify-otp`      | Public         |
| `/auth/reset-password`  | Reset token    |
| `/auth/logout`          | Access token   |
| Các API còn lại         | Access token   |

---

## Access token

Access token là JWT stateless và có lifetime ngắn.

Ví dụ:

```env
JWT_EXPIRES_IN="1h"
```

Access token đang còn hạn không thể bị revoke trực tiếp nếu server không duy trì blacklist/state tương ứng.

Vì vậy access token nên có lifetime ngắn.

---

## Refresh token

Refresh token được lưu dưới dạng **SHA-256 hash** trong database.

Không lưu refresh token plaintext.

Mỗi lần refresh:

```text
Refresh Token A
      │
      ▼
Validate
      │
      ▼
Revoke A
      │
      ▼
Create B
      │
      ▼
Access Token + Refresh Token B
```

Refresh token được **rotate** sau mỗi lần sử dụng.

Refresh token cũng được revoke khi:

* Logout.
* Change password.
* Reset password.
* Session bị revoke.

---

# 🔑 Password

Password được hash bằng bcrypt.

Password plaintext:

```text
Never store
Never log
Never return in API response
```

Password không bao giờ được ghi vào application log.

---

# 🔢 Forgot Password & OTP

Forgot-password flow:

```text
POST /auth/forgot-password
        │
        ▼
Generate OTP
        │
        ▼
Send email
        │
        ▼
POST /auth/verify-otp
        │
        ▼
Reset token
        │
        ▼
PUT /auth/reset-password
```

OTP được generate bằng:

```text
crypto.randomInt
```

OTP comparison sử dụng constant-time comparison.

OTP sẽ bị invalidate nếu:

* Hết hạn.
* Nhập sai quá số lần cho phép.
* Đã được sử dụng.

Default:

```text
OTP_MAX_ATTEMPTS=5
```

Trong production, SMTP configuration là bắt buộc.

Trong development/test environment, nếu SMTP chưa được cấu hình, OTP có thể được ghi vào log để thuận tiện debug.

---

# 🛡️ Security

Application có các lớp bảo vệ:

### Rate limiting

Toàn API:

```text
600 requests / 15 minutes
```

Authentication-sensitive endpoints:

```text
login
register
verify-otp
reset-password
→ 5 requests / 15 minutes
```

Forgot password:

```text
5 requests / hour
```

---

### Helmet

`helmet` được sử dụng để thiết lập các HTTP security headers.

---

### Request body limit

JSON request body được giới hạn bằng:

```text
JSON_BODY_LIMIT
```

Giá trị cụ thể được cấu hình trong application environment/config.

---

### CORS

Production yêu cầu whitelist thông qua:

```env
CORS_ORIGINS="https://app.example.com"
```

Không nên dùng wildcard CORS trong production nếu application có authentication credentials.

---

### JWT Secret

Không có fallback secret.

Nếu:

```env
JWT_SECRET
```

không tồn tại, application phải fail fast khi startup.

---

# ❗ Error Response

API sử dụng format lỗi thống nhất:

```json
{
  "code": "OTP_EXPIRED",
  "message": "OtpExpired"
}
```

HTTP status được sử dụng cho HTTP semantics.

Ví dụ:

```http
400 Bad Request
```

Body:

```json
{
  "code": "OTP_EXPIRED",
  "message": "OtpExpired"
}
```

## Client error handling

Client nên branch theo:

```text
code
```

Không nên branch theo:

```text
message
```

### Ý nghĩa

```text
HTTP status
    ↓
HTTP-level semantics

code
    ↓
Stable machine-readable error identifier

message
    ↓
Human-readable description
```

---

# 📌 API Endpoints

> Đây là mục lục nhanh. Swagger tại `/docs` và OpenAPI tại `/openapi.json` là tài liệu API đầy đủ.

## Health

| Method | Path            | Description                            |
| ------ | --------------- | -------------------------------------- |
| `GET`  | `/health/live`  | Process liveness check                 |
| `GET`  | `/health/ready` | Application + database readiness check |

---

## Auth

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| `POST` | `/auth/login`           | Login → token, refreshToken, user    |
| `POST` | `/auth/register`        | Register → token, refreshToken, user |
| `POST` | `/auth/refresh`         | Rotate refresh token                 |
| `POST` | `/auth/logout`          | Revoke refresh token/session         |
| `GET`  | `/auth/me`              | Current user profile                 |
| `PUT`  | `/auth/change-password` | Change password                      |
| `PUT`  | `/auth/profile`         | Update profile                       |
| `POST` | `/auth/forgot-password` | Request password reset OTP           |
| `POST` | `/auth/verify-otp`      | Verify OTP and obtain reset token    |
| `PUT`  | `/auth/reset-password`  | Reset password                       |

---

## User Settings

| Method | Path           | Description                  |
| ------ | -------------- | ---------------------------- |
| `GET`  | `/me/settings` | Get user settings            |
| `PUT`  | `/me/settings` | Partial update user settings |

User settings được tạo với giá trị mặc định trong lần đọc đầu tiên nếu chưa tồn tại.

---

## Exercises

| Method | Path         | Description                               |
| ------ | ------------ | ----------------------------------------- |
| `GET`  | `/exercises` | Exercise catalog with search & pagination |

---

## Workout Plans

| Method   | Path            | Description              |
| -------- | --------------- | ------------------------ |
| `GET`    | `/workouts`     | Get user's workout plans |
| `GET`    | `/workouts/:id` | Get workout plan detail  |
| `POST`   | `/workouts`     | Create workout plan      |
| `PUT`    | `/workouts/:id` | Update workout plan      |
| `DELETE` | `/workouts/:id` | Delete workout plan      |

---

## Workout Exercises

| Method   | Path                            | Description                  |
| -------- | ------------------------------- | ---------------------------- |
| `GET`    | `/workout-exercises/:workoutId` | List exercises in a workout  |
| `POST`   | `/workout-exercises`            | Add exercise to workout      |
| `PUT`    | `/workout-exercises/:id`        | Update sets/reps/weight      |
| `DELETE` | `/workout-exercises/:id`        | Remove exercise from workout |

---

## Workout Schedules

| Method   | Path                                    | Description                |
| -------- | --------------------------------------- | -------------------------- |
| `GET`    | `/workout-schedules`                    | User schedule with filters |
| `GET`    | `/workout-schedules/:id`                | Schedule detail            |
| `GET`    | `/workout-schedules/workout/:workoutId` | Schedule by workout        |
| `POST`   | `/workout-schedules`                    | Create schedule            |
| `PUT`    | `/workout-schedules/:id`                | Update scheduled date      |
| `PUT`    | `/workout-schedules/:id/complete`       | Mark schedule completed    |
| `DELETE` | `/workout-schedules/:id`                | Cancel/delete schedule     |

Supported filters:

```text
from
to
workoutId
isCompleted
```

---

## Workout Comments

| Method   | Path                           | Description    |
| -------- | ------------------------------ | -------------- |
| `GET`    | `/workout-comments/:workoutId` | Get comments   |
| `POST`   | `/workout-comments`            | Create comment |
| `PUT`    | `/workout-comments/:id`        | Edit comment   |
| `DELETE` | `/workout-comments/:id`        | Delete comment |

---

## Workout Sessions

| Method   | Path                           | Description                         |
| -------- | ------------------------------ | ----------------------------------- |
| `GET`    | `/workout-sessions`            | Workout history                     |
| `GET`    | `/workout-sessions/:id`        | Session detail with sets            |
| `POST`   | `/workout-sessions`            | Start/create actual workout session |
| `PUT`    | `/workout-sessions/:id/finish` | Finish session                      |
| `DELETE` | `/workout-sessions/:id`        | Delete session                      |

Workout session có thể nhận danh sách `sets` để ghi toàn bộ buổi tập trong một request.

Khi finish session, application có thể:

* Ghi workout sets.
* Tính volume.
* Đánh dấu schedule hoàn thành nếu session liên kết với schedule.

---

# 📊 Reports

| Method | Path                        | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| `GET`  | `/reports`                  | Summary statistics + 8-week trends |
| `GET`  | `/reports/personal-records` | Personal records                   |
| `GET`  | `/reports/muscle-load`      | Muscle load statistics             |

Muscle load hỗ trợ:

```text
GET /reports/muscle-load?days=7
```

---

# 🏋️ Workout Session & Reporting

`ScheduleWorkout.isCompleted` không chứa dữ liệu thực tế như:

* Thời gian tập.
* Số hiệp thực hiện.
* Số reps thực tế.
* Weight thực tế.
* Volume.
* Personal records.

Vì vậy reporting ưu tiên dữ liệu từ:

```text
WorkoutSession
    ↓
WorkoutSet
```

---

## Backward compatibility

Các tài khoản cũ có thể chưa có `WorkoutSession`.

Trong trường hợp đó, `/reports` fallback sang dữ liệu schedule.

Response sẽ chứa:

```json
{
  "source": "schedules"
}
```

Điều này có nghĩa:

> Statistics là dữ liệu ước lượng dựa trên scheduled workouts.

Khi user đã có workout sessions:

```json
{
  "source": "sessions"
}
```

Điều này có nghĩa:

> Statistics được tính từ workout thực tế.

Client có thể sử dụng `source` để phân biệt độ tin cậy của dữ liệu.

---

# 🏆 Personal Records

Endpoint:

```http
GET /reports/personal-records
```

PR được tính từ workout sessions thực tế.

Bao gồm:

* Weight nặng nhất.
* Estimated 1RM.

Estimated 1RM sử dụng công thức Epley:

```text
1RM = weight × (1 + reps / 30)
```

Ví dụ:

```text
100kg × 5 reps

1RM ≈ 100 × (1 + 5 / 30)
   ≈ 116.67kg
```

---

# 💪 Muscle Load

Endpoint:

```http
GET /reports/muscle-load
```

Có thể truyền:

```text
?days=7
```

Dữ liệu được tính từ workout thực tế và có thể được tổng hợp:

```text
Muscle Group
    │
    ├── Exercise A
    ├── Exercise B
    └── Exercise C
```

---

# 🧪 Testing

Unit tests sử dụng repository mocks/fakes nên **không yêu cầu database**.

## Watch mode

```bash
npm test
```

## Run once

```bash
npm run test:run
```

## Coverage

```bash
npm run test:coverage
```

## Type checking

```bash
npm run typecheck
```

---

## Integration tests

Integration test:

```text
tests/auth.flow.integration.test.ts
```

chỉ chạy khi:

```env
RUN_INTEGRATION_TESTS=true
```

Ví dụ:

```bash
RUN_INTEGRATION_TESTS=true npm run test:run
```

Integration tests yêu cầu MySQL thật.

Không bật integration tests trên database development thông thường nếu test có thể tạo hoặc thay đổi dữ liệu.

Nên sử dụng database riêng cho integration tests.

---

# 🔄 CI

CI workflow:

```text
.github/workflows/backend.yml
```

Pipeline thực hiện:

```text
Start MySQL 8
      │
      ▼
Install dependencies
      │
      ▼
Typecheck
      │
      ▼
Tests
      │
      ▼
Build
```

CI không nên sử dụng database production.

---

# 📝 Logging

Application sử dụng **Pino** để ghi structured logs.

Mỗi request có:

```text
x-request-id
```

Nếu client gửi:

```http
x-request-id: abc-123
```

application có thể reuse request ID đó.

Nếu client không gửi, server tự generate request ID.

---

## Sensitive data

Các dữ liệu sau không được xuất plaintext vào logs:

```text
Password
JWT access token
Refresh token
OTP
Reset token
```

Các trường sensitive phải được redact/mask trước khi logging.

---

## Development logging

Có thể dùng `pino-pretty` để đọc log dễ hơn:

```bash
npm run dev | npx pino-pretty
```

Production nên ưu tiên structured JSON logs để dễ tích hợp với log aggregation/monitoring systems.

---

# 📦 Build

Build TypeScript:

```bash
npm run build
```

Output phụ thuộc vào `tsconfig.json`, thông thường:

```text
dist/
```

Sau đó:

```bash
npm start
```

---

# 🗂️ Database Migration Workflow

## Development

Sau khi chỉnh sửa:

```text
prisma/schema.prisma
        │
        ▼
npm run prisma:migrate
        │
        ▼
Migration created
        │
        ▼
Prisma Client updated
```

Nếu cần regenerate riêng:

```bash
npm run prisma:generate
```

---

## Production

Production chỉ apply migration đã commit:

```bash
npx prisma migrate deploy
```

Không sử dụng:

```bash
npx prisma migrate dev
```

trên production database.

---

# 🔧 Useful Commands

| Command                     | Purpose                 |
| --------------------------- | ----------------------- |
| `npm install`               | Install dependencies    |
| `npm run dev`               | Development server      |
| `npm run build`             | Production build        |
| `npm start`                 | Start production server |
| `npm run typecheck`         | TypeScript checking     |
| `npm test`                  | Test watch mode         |
| `npm run test:run`          | Run tests once          |
| `npm run test:coverage`     | Generate coverage       |
| `npm run prisma:generate`   | Generate Prisma Client  |
| `npm run prisma:migrate`    | Development migration   |
| `npx prisma migrate deploy` | Production migration    |
| `npx prisma studio`         | Open Prisma Studio      |

---

# 📐 Migration from .NET

Project được migrate từ:

```text
.NET
C#
Clean Architecture
Entity Framework Core
```

sang:

```text
Node.js
TypeScript
Express.js
Prisma
MySQL
```

Một số mapping chính:

| .NET                  | Node.js            |
| --------------------- | ------------------ |
| ASP.NET Controller    | Express Controller |
| Middleware            | Express Middleware |
| Application Service   | Service            |
| Repository            | Repository         |
| Entity Framework Core | Prisma             |
| Data Transfer Object  | DTO + Zod          |
| FluentValidation      | Zod                |
| JWT Authentication    | JWT                |
| BCrypt                | bcrypt             |
| appsettings.json      | `.env` / config    |
| xUnit/NUnit           | Vitest             |

Các quyết định migration và những khác biệt có chủ đích được ghi trong:

```text
DECISIONS.md
```

---

# ⚙️ Design Principles

Project cố gắng duy trì các nguyên tắc sau:

### Separation of concerns

Controller không nên chứa business logic.

### Service owns business rules

Business rules nên nằm ở service thay vì route/controller.

### Repository owns persistence

Prisma queries nên được tập trung ở repository.

### Validate at the boundary

Request input được validate bằng Zod trước khi đi vào business logic.

### Explicit authorization

Resource ownership phải được kiểm tra ở service/repository flow.

User không được truy cập hoặc sửa resource thuộc user khác chỉ bằng cách thay đổi `:id`.

### Fail fast

Configuration bắt buộc như:

```text
DATABASE_URL
JWT_SECRET
```

phải được kiểm tra khi startup.

---

# 🔒 Resource Ownership

Các resource thuộc user phải được kiểm tra ownership.

Ví dụ:

```text
User A
 └── Workout #10

User B
 └── Workout #20
```

User A không được:

```http
GET /workouts/20
```

hoặc:

```http
PUT /workouts/20
```

chỉ vì biết ID.

Authorization phải được thực hiện ở backend và không được tin tưởng dữ liệu từ client.

---

# 🚨 Production Checklist

Trước khi deploy production:

* [ ] `NODE_ENV=production`
* [ ] `JWT_SECRET` là secret ngẫu nhiên đủ mạnh.
* [ ] `DATABASE_URL` trỏ tới production database.
* [ ] `CORS_ORIGINS` được whitelist chính xác.
* [ ] SMTP được cấu hình nếu sử dụng forgot-password.
* [ ] Không dùng default/fallback JWT secret.
* [ ] Chạy `prisma migrate deploy`.
* [ ] Không chạy `prisma migrate dev` trên production.
* [ ] Docker healthcheck sử dụng `/health/ready`.
* [ ] Logging không chứa password/token/OTP.
* [ ] Integration tests không trỏ vào production database.
* [ ] Database backup được cấu hình.
* [ ] HTTPS được sử dụng ở production.
* [ ] Rate limiting được bật.
* [ ] Swagger/OpenAPI exposure được xem xét theo deployment policy.

---

# 🩺 Troubleshooting

## Server không start

Kiểm tra:

```env
DATABASE_URL
JWT_SECRET
```

Hai biến này bắt buộc.

---

## Prisma Client error

Chạy:

```bash
npm run prisma:generate
```

Sau đó build lại:

```bash
npm run build
```

---

## Migration error

Kiểm tra:

```text
DATABASE_URL
```

và đảm bảo MySQL đang chạy.

Development:

```bash
npm run prisma:migrate
```

Production:

```bash
npx prisma migrate deploy
```

---

## Docker không kết nối được MySQL

Nếu MySQL chạy trên host:

```text
host.docker.internal
```

Nếu MySQL chạy trong Docker Compose:

```text
mysql
```

Không sử dụng:

```text
localhost
```

để backend container kết nối sang một container khác.

---

# 📄 License

Nếu repository có license riêng, đặt license information tại đây.

Nếu chưa có license, không nên tự động tuyên bố project sử dụng MIT/Apache/GPL cho tới khi license được xác định rõ.

---

# 👨‍💻 Development Notes

Đây là backend API cho Workout Tracker và ưu tiên:

1. Correctness
2. Security
3. Clear domain separation
4. Testability
5. Backward compatibility
6. Production-safe configuration

Các thay đổi kiến trúc hoặc migration rule quan trọng nên được ghi nhận trong:

```text
DECISIONS.md
```

để tránh làm mất các quyết định thiết kế trong những lần refactor tiếp theo.
