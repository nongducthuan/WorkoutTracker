import { prisma } from "../config/prisma";
import { User } from "@prisma/client";

export interface CreateUserData {
  fullName: string;
  userName: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  password?: string;
  avatarUrl?: string | null;
  weightKg?: number | null;
  heightCm?: number | null;
  birthday?: Date | null;
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByUserNameOrEmail(identifier: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ userName: identifier }, { email: identifier }],
      },
    });
  }

  async findByUserName(userName: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { userName } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email } });
  }

  async findByEmailExcludingUser(email: string, userId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}
