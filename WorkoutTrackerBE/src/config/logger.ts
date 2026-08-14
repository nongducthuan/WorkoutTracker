import pino from "pino";
import { config } from "./env";

export const logger = pino({
  level: config.isTest ? "silent" : config.logLevel,
  // Pretty output is intentionally not wired in: it would add a dependency that is
  // only useful locally. `npm run dev | npx pino-pretty` covers that need.
  base: { service: "workout-tracker-be" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.newPassword",
      "*.oldPassword",
      "*.otpCode",
      "*.resetToken",
      "*.refreshToken",
    ],
    censor: "[redacted]",
  },
});
