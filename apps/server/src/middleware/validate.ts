import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './errorHandler';

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0]?.message || 'Validation error';
        throw new AppError(firstError, StatusCodes.BAD_REQUEST);
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0]?.message || 'Query validation error';
        throw new AppError(firstError, StatusCodes.BAD_REQUEST);
      }
      next(error);
    }
  };
};
