import { prisma } from "../config/prisma";
import { UserSettings } from "@prisma/client";

export type UserSettingsUpdate = Partial<
  Omit<UserSettings, "id" | "userId" | "updatedAt">
>;

export class UserSettingsRepository {
  async findByUserId(userId: string): Promise<UserSettings | null> {
    return prisma.userSettings.findUnique({ where: { userId } });
  }

  /** Rows are created lazily, so the first read has to materialise the defaults. */
  async createDefault(userId: string): Promise<UserSettings> {
    return prisma.userSettings.create({ data: { userId } });
  }

  async upsert(userId: string, data: UserSettingsUpdate): Promise<UserSettings> {
    return prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
