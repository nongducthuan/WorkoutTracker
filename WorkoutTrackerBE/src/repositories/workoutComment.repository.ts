import { prisma } from "../config/prisma";
import { WorkoutComment } from "@prisma/client";

export interface WorkoutCommentResponse {
  id: string;
  workoutId: string;
  comment: string;
  userName: string;
  userId: string;
  createdAt: Date;
}

export class WorkoutCommentRepository {
  async verifyWorkoutPlanOwnership(workoutId: string, userId: string): Promise<boolean> {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: workoutId, userId },
    });
    return !!plan;
  }

  async findByWorkoutId(workoutId: string): Promise<WorkoutCommentResponse[]> {
    const items = await prisma.workoutComment.findMany({
      where: { workoutId },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => ({
      id: item.id,
      workoutId: item.workoutId,
      comment: item.comment,
      userName: item.user.fullName,
      userId: item.userId,
      createdAt: item.createdAt,
    }));
  }

  async findByIdAndPlanOwner(id: string, userId: string): Promise<WorkoutComment | null> {
    return prisma.workoutComment.findFirst({
      where: {
        id,
        workout: { userId },
      },
    });
  }

  async create(data: {
    workoutId: string;
    userId: string;
    comment: string;
  }): Promise<WorkoutCommentResponse> {
    const created = await prisma.workoutComment.create({
      data,
      include: {
        user: true,
      },
    });

    return {
      id: created.id,
      workoutId: created.workoutId,
      comment: created.comment,
      userName: created.user.fullName,
      userId: created.userId,
      createdAt: created.createdAt,
    };
  }

  async update(id: string, comment: string): Promise<WorkoutCommentResponse> {
    const updated = await prisma.workoutComment.update({
      where: { id },
      data: {
        comment,
        createdAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    return {
      id: updated.id,
      workoutId: updated.workoutId,
      comment: updated.comment,
      userName: updated.user.fullName,
      userId: updated.userId,
      createdAt: updated.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.workoutComment.delete({ where: { id } });
  }
}
