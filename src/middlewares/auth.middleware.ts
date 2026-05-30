import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createAppError } from '../utils/errors';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createAppError(401, 'UNAUTHORIZED', 'No token provided or invalid format'));
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';

  try {
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      orgId: decoded.orgId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next(createAppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
};