import { prisma } from "../config/prisma";
import { User } from "@prisma/client";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByUserNameOrEmail(identifier: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [
          { userName: identifier },
          { email: identifier },
        ],
      },
    });
  }

  async findByUserName(userName: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { userName },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email },
    });
  }

  async findByEmailExcludingUser(email: string, userId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });
  }

  async create(data: Omit<User, "id">): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<Omit<User, "id">>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
