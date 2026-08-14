import { Request, Response, NextFunction } from "express";
import { ExerciseService } from "../services/exercise.service";
import { GetExercisesQuerySchema } from "../dtos/exercise.dto";

export class ExerciseController {
  private exerciseService: ExerciseService;

  constructor() {
    this.exerciseService = new ExerciseService();
  }

  getExercises = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = GetExercisesQuerySchema.parse(req.query);
      const result = await this.exerciseService.getAllExercises(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await this.exerciseService.getCategories());
    } catch (error) {
      next(error);
    }
  };
}
