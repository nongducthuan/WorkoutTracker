import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { AppError, ErrorCodes } from "../errors/appError";

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("JwtTokenInvalid", 401, ErrorCodes.JWT_TOKEN_INVALID));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    if (!decoded || !decoded.sub || !uuidRegex.test(decoded.sub)) {
      return next(new AppError("JwtTokenInvalid", 401, ErrorCodes.JWT_TOKEN_INVALID));
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    return next(new AppError("JwtTokenInvalid", 401, ErrorCodes.JWT_TOKEN_INVALID));
  }
};
