import { prisma } from "../config/prisma";
import { PasswordReset } from "@prisma/client";

export class PasswordResetRepository {
  async create(data: {
    userId: string;
    otpCode: string;
    otpExpiresAt: Date;
  }): Promise<PasswordReset> {
    return prisma.passwordReset.create({ data });
  }

  async findLatestByUserId(userId: string): Promise<PasswordReset | null> {
    return prisma.passwordReset.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByResetToken(resetToken: string): Promise<PasswordReset | null> {
    return prisma.passwordReset.findFirst({ where: { resetToken } });
  }

  async markVerified(
    id: string,
    resetToken: string,
    tokenExpiresAt: Date
  ): Promise<PasswordReset> {
    return prisma.passwordReset.update({
      where: { id },
      data: { isVerified: true, resetToken, tokenExpiresAt },
    });
  }

  async markUsed(id: string): Promise<PasswordReset> {
    return prisma.passwordReset.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  /** Returns the new attempt count so the caller can enforce the lockout. */
  async incrementAttempt(id: string): Promise<number> {
    const updated = await prisma.passwordReset.update({
      where: { id },
      data: { attemptCount: { increment: 1 } },
      select: { attemptCount: true },
    });
    return updated.attemptCount;
  }

  /**
   * Requesting a new code should retire the old ones, otherwise an attacker gets
   * several live codes to guess against at the same time.
   */
  async invalidateActiveForUser(userId: string): Promise<void> {
    await prisma.passwordReset.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true },
    });
  }
}
