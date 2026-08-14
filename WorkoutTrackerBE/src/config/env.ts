import dotenv from "dotenv";

dotenv.config();

const required = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[config] Missing required environment variable ${name}. ` +
        `Copy .env.example to .env and fill it in before starting the server.`
    );
  }
  return value;
};

const optionalInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV || "development";

// A comma separated whitelist. An empty value means "reflect any origin", which is
// only tolerable outside production — see app.ts.
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const config = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  port: optionalInt("PORT", 8080),
  databaseUrl: required("DATABASE_URL"),

  // No fallback on purpose: a hardcoded default means every deployment that forgets
  // to set the variable ships a secret that is readable in this repository.
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  refreshTokenDays: optionalInt("REFRESH_TOKEN_DAYS", 30),

  corsOrigins,
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "100kb",
  logLevel: process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug"),

  otp: {
    ttlMinutes: optionalInt("OTP_TTL_MINUTES", 5),
    resetTokenTtlMinutes: optionalInt("RESET_TOKEN_TTL_MINUTES", 10),
    maxAttempts: optionalInt("OTP_MAX_ATTEMPTS", 5),
  },

  smtp: {
    host: process.env.SMTP_HOST || "",
    port: optionalInt("SMTP_PORT", 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "Workout Tracker <no-reply@workouttracker.app>",
  },
};

export const isSmtpConfigured = (): boolean =>
  Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
