import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { EnumResponse } from '@common/EnumResponse';
import { respond } from '@common/response';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // formato "Bearer token"

  if (!token) {
    return respond(res, EnumResponse.UNAUTHORIZED, {}, 'Token requerido');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.AUTH_JWT_SECRET || 'dev-secret'
    );
    req.user = decoded; // aquí queda { sub, email, iat, exp }
    next();
  } catch (err) {
    return respond(res, EnumResponse.UNAUTHORIZED, err, 'Token requerido');
  }
};
