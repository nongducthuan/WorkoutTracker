import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key-workout-tracker",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
