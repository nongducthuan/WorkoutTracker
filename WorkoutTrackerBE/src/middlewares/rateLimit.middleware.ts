import rateLimit, { Options } from "express-rate-limit";
import { ErrorCodes } from "../errors/appError";
import { config } from "../config/env";

const base: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  // Rate limiting turns integration tests into a coin flip; disable it there.
  skip: () => config.isTest,
  handler: (_req, res) => {
    res.status(429).json({
      code: ErrorCodes.RATE_LIMITED,
      message: "TooManyRequests",
    });
  },
};

/** Broad ceiling for the whole API so a single client cannot saturate the server. */
export const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 600,
});

/**
 * Credential endpoints. 5 attempts per 15 minutes per IP: enough for a user who
 * mistypes, far too slow to walk a 6 digit OTP space or a password list.
 */
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
});

/** Sending mail is expensive and spammable, so it gets its own tighter budget. */
export const otpRequestLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
});
