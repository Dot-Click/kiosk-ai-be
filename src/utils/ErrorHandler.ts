import { Request, Response } from 'express';
import { logger } from '../functions/logger';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorHandler {
  static handleError(err: any, req: Request, res: Response): void {
    let { statusCode, message } = err;
    
    if (!statusCode) {
      statusCode = 500;
    }

    if (process.env.NODE_ENV === 'development') {
      logger.error(`Error: ${message}`);
      logger.error(`Stack: ${err.stack}`);
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
    }

    if (err.code === 11000) {
      statusCode = 409;
      message = 'Duplicate field value entered';
    }

    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    res.status(statusCode).json({
      success: false,
      message: message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}