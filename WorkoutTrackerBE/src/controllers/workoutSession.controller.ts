import { Request, Response, NextFunction } from "express";
import { WorkoutSessionService } from "../services/workoutSession.service";
import { GetSessionsQuerySchema } from "../dtos/workoutSession.dto";

export class WorkoutSessionController {
  private service: WorkoutSessionService;

  constructor(service: WorkoutSessionService = new WorkoutSessionService()) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = GetSessionsQuerySchema.parse(req.query);
      const result = await this.service.getAll(query, (req as any).user.sub);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getById(req.params.id, (req as any).user.sub);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.create(req.body, (req as any).user.sub);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  finish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.finish(req.params.id, req.body, (req as any).user.sub);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.delete(req.params.id, (req as any).user.sub);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
