export type AppError = Error & {
  statusCode: number;
  errorCode: string;
  isAppError: true;
};

export const createAppError = (statusCode: number, errorCode: string, message: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  error.isAppError = true;
  
  Error.captureStackTrace(error, createAppError);
  
  return error;
};