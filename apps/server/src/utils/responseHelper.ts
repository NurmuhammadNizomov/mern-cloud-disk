import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';

export interface StandardApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number = StatusCodes.OK,
  message: string,
  data?: T
): Response => {
  const response: StandardApiResponse<T> = {
    success: true,
    statusCode,
    message,
    ...(data !== undefined ? { data } : {}),
    timestamp: dayjs().toISOString()
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  message: string,
  error?: any
): Response => {
  const response: StandardApiResponse = {
    success: false,
    statusCode,
    message,
    ...(error !== undefined ? { error } : {}),
    timestamp: dayjs().toISOString()
  };
  return res.status(statusCode).json(response);
};
