/**
 * Stable, machine readable error identifiers.
 *
 * `AppError.message` keeps the historical English string so existing clients that
 * compare on it keep working; `code` is what new client code should branch on.
 */
export const ErrorCodes = {
  // auth
  USER_NAME_NOT_EXIST: "USER_NAME_NOT_EXIST",
  INCORRECT_PASSWORD: "INCORRECT_PASSWORD",
  USER_NAME_TAKEN: "USER_NAME_TAKEN",
  EMAIL_TAKEN: "EMAIL_TAKEN",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PASSWORD_MISMATCH: "PASSWORD_MISMATCH",
  EMAIL_NOT_EXIST: "EMAIL_NOT_EXIST",
  OTP_NOT_FOUND: "OTP_NOT_FOUND",
  OTP_ALREADY_USED: "OTP_ALREADY_USED",
  OTP_EXPIRED: "OTP_EXPIRED",
  OTP_INCORRECT: "OTP_INCORRECT",
  OTP_TOO_MANY_ATTEMPTS: "OTP_TOO_MANY_ATTEMPTS",
  OTP_NOT_VERIFIED: "OTP_NOT_VERIFIED",
  RESET_TOKEN_INVALID: "RESET_TOKEN_INVALID",
  RESET_TOKEN_USED: "RESET_TOKEN_USED",
  RESET_TOKEN_EXPIRED: "RESET_TOKEN_EXPIRED",
  JWT_TOKEN_INVALID: "JWT_TOKEN_INVALID",
  REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",

  // resources
  WORKOUT_PLAN_NOT_FOUND: "WORKOUT_PLAN_NOT_FOUND",
  WORKOUT_PLAN_NAME_TAKEN: "WORKOUT_PLAN_NAME_TAKEN",
  WORKOUT_EXERCISE_NOT_FOUND: "WORKOUT_EXERCISE_NOT_FOUND",
  SCHEDULE_NOT_FOUND: "SCHEDULE_NOT_FOUND",
  COMMENT_NOT_FOUND: "COMMENT_NOT_FOUND",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  SESSION_ALREADY_FINISHED: "SESSION_ALREADY_FINISHED",
  EXERCISE_NOT_FOUND: "EXERCISE_NOT_FOUND",

  // generic
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_DATE: "INVALID_DATE",
  RATE_LIMITED: "RATE_LIMITED",
  MAIL_SEND_FAILED: "MAIL_SEND_FAILED",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;

  constructor(
    message: string,
    statusCode: number = 400,
    code: ErrorCode = ErrorCodes.INVALID_INPUT
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
