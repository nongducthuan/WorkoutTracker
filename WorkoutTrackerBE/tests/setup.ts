import dotenv from "dotenv";

// Load .env first so the opt-in integration suite can reach a real database,
// then fill in anything still missing. Unit tests must not depend on a
// developer's local .env, so `config`'s required variables always end up set.
dotenv.config();

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-used-anywhere-else";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "mysql://test:test@localhost:3306/workouttracker_test";
