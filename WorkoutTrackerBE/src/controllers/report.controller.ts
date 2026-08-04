import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/report.service";

export class ReportController {
  private service: ReportService;

  constructor() {
    this.service = new ReportService();
  }

  getReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const report = await this.service.generateReport(userId);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };
}
