import crypto from "crypto";

/**
 * `Math.random` is not a CSPRNG, and a predictable 6 digit reset code is as good
 * as no code at all — use `crypto.randomInt` instead.
 */
export const generateOtpCode = (): string => {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/** Constant time compare so a wrong OTP cannot be found byte by byte via timing. */
export const safeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};
