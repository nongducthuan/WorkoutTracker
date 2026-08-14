import { Request, Response, NextFunction } from "express";
import { UserSettingsService } from "../services/userSettings.service";

export class UserSettingsController {
  private service: UserSettingsService;

  constructor(service: UserSettingsService = new UserSettingsService()) {
    this.service = service;
  }

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.get((req as any).user.sub);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.update((req as any).user.sub, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
