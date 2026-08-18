# WorkoutTracker - PulseMobile

Ứng dụng theo dõi tập luyện cá nhân gồm **mobile app** (React Native) và **REST API backend** (Node.js).

---

## Công nghệ

| Phần | Công nghệ |
|------|-----------|
| **Frontend** | React Native 0.86, TypeScript, React Navigation, TanStack Query, React Hook Form, Zod, i18next |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, MySQL |
| **Auth** | JWT, bcrypt |
| **Khác** | Swagger UI, Nodemailer, Vitest, Docker |

---

## Cấu trúc

```
WorkoutTracker/
├── WorkoutTrackerFE/   # React Native app (PulseMobile)
└── WorkoutTrackerBE/   # Express REST API
```

---

## Khởi động

### Yêu cầu
- Node.js >= 18
- MySQL
- Android Studio (để chạy Android)

### Backend

```bash
cd WorkoutTrackerBE

# Cài dependencies
npm install

# Cấu hình môi trường
cp .env.example .env
# Chỉnh sửa .env với thông tin DB, JWT secret, email...

# Migrate & seed DB
npm run prisma:migrate
npx prisma db seed

# Chạy dev
npm run dev
```

> API mặc định chạy tại `http://localhost:3000`
> Swagger docs: `http://localhost:3000/api-docs`

### Frontend

```bash
cd WorkoutTrackerFE

# Cài dependencies
npm install

# Khởi động Metro bundler
npm start

# Chạy Android
npm run android
```

---

## Chức năng chính

- **Xác thực** — Đăng ký, đăng nhập, quên mật khẩu qua email
- **Quản lý bài tập** — Thư viện exercise, tạo workout plan tùy chỉnh
- **Active Workout** — Theo dõi buổi tập theo thời gian thực
- **Lịch tập** — Đặt lịch workout theo ngày
- **Báo cáo** — Thống kê tiến độ, biểu đồ kết quả
- **Thành tích** — Hệ thống achievements
- **Bình luận** — Comment trên workout
- **Thông báo** — Nhắc nhở tập luyện
- **Đa ngôn ngữ** — Hỗ trợ i18n

---

## Kiểm thử (Backend)

```bash
npm run test          # watch mode
npm run test:run      # chạy một lần
npm run test:coverage # coverage report
```
