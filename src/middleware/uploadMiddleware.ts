import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import {upload} from '../config/multer';

export const uploadSingleImage = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'File size too large. Maximum 10MB allowed.'));
        }
        if (err.message === 'Invalid file type. Only images are allowed.') {
          return next(new ApiError(400, 'Invalid file type. Only images are allowed.'));
        }
        return next(new ApiError(400, err.message));
      }
      next();
    });
  };
};

export const validateUploadCode = (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;
  
  if (!code || typeof code !== 'string' || code.length !== 6) {
    return next(new ApiError(400, 'Valid 6-digit code is required'));
  }
  
  next();
};