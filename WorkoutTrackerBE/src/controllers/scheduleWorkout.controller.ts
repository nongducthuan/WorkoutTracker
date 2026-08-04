import { Request, Response, NextFunction } from "express";
import { ScheduleWorkoutService } from "../services/scheduleWorkout.service";

export class ScheduleWorkoutController {
  private service: ScheduleWorkoutService;

  constructor() {
    this.service = new ScheduleWorkoutService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const result = await this.service.getAll(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

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

  complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.sub;
      const result = await this.service.complete(id, userId);
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
