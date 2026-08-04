import { Request, Response, NextFunction } from "express";
import { WorkoutExerciseService } from "../services/workoutExercise.service";

export class WorkoutExerciseController {
  private service: WorkoutExerciseService;

  constructor() {
    this.service = new WorkoutExerciseService();
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
      const result = await this.service.addWorkoutExercise(req.body, userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.sub;
      const result = await this.service.updateWorkoutExercise(id, req.body, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.sub;
      const result = await this.service.deleteWorkoutExercise(id, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
