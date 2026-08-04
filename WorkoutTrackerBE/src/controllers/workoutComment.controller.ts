import { Request, Response, NextFunction } from "express";
import { WorkoutCommentService } from "../services/workoutComment.service";

export class WorkoutCommentController {
  private service: WorkoutCommentService;

  constructor() {
    this.service = new WorkoutCommentService();
  }

  getByWorkoutId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workoutId } = req.params;
      const userId = (req as any).user.sub;
      const result = await this.service.getByWorkoutId(workoutId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const result = await this.service.create(req.body, userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.sub;
      const result = await this.service.update(id, req.body, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.sub;
      const result = await this.service.delete(id, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
