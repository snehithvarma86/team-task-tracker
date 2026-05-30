import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/errors';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError(401, 'UNAUTHORIZED', 'User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createAppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
    }
    next();
  };
};