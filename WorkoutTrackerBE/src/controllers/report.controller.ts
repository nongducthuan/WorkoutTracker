import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/report.service";
import { MuscleLoadQuerySchema, ExerciseHistoryQuerySchema } from "../dtos/report.dto";
import { AppError, ErrorCodes } from "../errors/appError";

export class ReportController {
  private service: ReportService;

  constructor(service: ReportService = new ReportService()) {
    this.service = service;
  }

  getReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await this.service.generateReport((req as any).user.sub);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  getPersonalRecords = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const records = await this.service.getPersonalRecords((req as any).user.sub);
      res.status(200).json(records);
    } catch (error) {
      next(error);
    }
  };

  getExerciseHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const exerciseId = Number.parseInt(req.params.exerciseId, 10);
      if (!Number.isInteger(exerciseId) || exerciseId < 1) {
        throw new AppError("InvalidInputs", 400, ErrorCodes.INVALID_INPUT);
      }

      const { weeks, sessionLimit } = ExerciseHistoryQuerySchema.parse(req.query);
      const result = await this.service.getExerciseHistory(
        (req as any).user.sub,
        exerciseId,
        weeks,
        sessionLimit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMuscleLoad = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { days } = MuscleLoadQuerySchema.parse(req.query);
      const result = await this.service.getMuscleLoad((req as any).user.sub, days);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
