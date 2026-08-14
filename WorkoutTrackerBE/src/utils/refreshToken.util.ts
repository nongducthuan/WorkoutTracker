import crypto from "crypto";

/** Opaque, high entropy value handed to the client. */
export const generateRefreshToken = (): string =>
  crypto.randomBytes(48).toString("hex");

/**
 * Only the hash is persisted, so a database leak does not hand out live sessions.
 * The token already carries 384 bits of entropy, so a plain SHA-256 (no salt, no
 * work factor) is enough and keeps lookups a single indexed query.
 */
export const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");
