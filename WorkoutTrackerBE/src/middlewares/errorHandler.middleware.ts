import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ErrorCodes } from "../errors/appError";
import { logger } from "../config/logger";

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    code: "ROUTE_NOT_FOUND",
    message: `Cannot ${req.method} ${req.path}`,
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const log = (req as any).log ?? logger;

  if (err instanceof AppError) {
    // 4xx are expected client mistakes, not incidents; log them at debug level.
    log.debug({ code: err.code, statusCode: err.statusCode }, err.message);
    res.status(err.statusCode).json({ code: err.code, message: err.message });
    return;
  }

  /**
   * `validate` only wraps `req.body`; query schemas are parsed inline in the
   * controllers, so a malformed query string used to arrive here as a raw
   * ZodError and be reported as a 500 — telling the client the server broke
   * when in fact the request was wrong.
   */
  if (err instanceof ZodError) {
    const message = err.errors[0]?.message || "InvalidInputs";
    log.debug({ issues: err.errors }, "Invalid request");
    res.status(400).json({ code: ErrorCodes.INVALID_INPUT, message });
    return;
  }

  log.error({ err }, "Unhandled error");
  res.status(500).json({
    code: ErrorCodes.INTERNAL,
    message: "Internal Server Error",
  });
};
