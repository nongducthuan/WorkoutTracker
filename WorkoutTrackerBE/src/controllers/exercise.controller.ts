import { Request, Response, NextFunction } from "express";
import { ExerciseService } from "../services/exercise.service";
import { GetExercisesQuerySchema } from "../dtos/exercise.dto";
import { AppError, ErrorCodes } from "../errors/appError";

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

  getExerciseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError("Invalid exercise id", 400, ErrorCodes.INVALID_INPUT);
      }
      const exercise = await this.exerciseService.getExerciseById(id);
      if (!exercise) {
        throw new AppError("Exercise not found", 404, ErrorCodes.EXERCISE_NOT_FOUND);
      }
      res.status(200).json(exercise);
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

