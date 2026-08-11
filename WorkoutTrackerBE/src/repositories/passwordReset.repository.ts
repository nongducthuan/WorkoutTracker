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
    return prisma.passwordReset.findFirst({
      where: { resetToken },
    });
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
}