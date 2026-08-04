import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface JwtPayload {
  sub: string;
  email: string;
  unique_name: string;
  name: string;
}

export const generateToken = (user: {
  id: string;
  email: string;
  userName: string;
  fullName: string;
}): string => {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    unique_name: user.userName,
    name: user.fullName,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
