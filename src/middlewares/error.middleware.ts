import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';

const isAppError = (err: any): err is AppError => {
  return err && typeof err === 'object' && err.isAppError === true;
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isAppError(err)) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      code: err.errorCode,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    });
  }

  console.error('Unhandled Error:', err);
  return res.status(500).json({
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
};