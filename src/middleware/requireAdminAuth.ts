import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";

/**
 * Requires valid admin JWT. Use on routes under /api/admin.
 */
export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ErrorHandler.handleError(
        new ApiError(401, "Unauthorized"),
        req,
        res
      );
    }
    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return ErrorHandler.handleError(
        new ApiError(500, "Server configuration error"),
        req,
        res
      );
    }
    jwt.verify(token, secret);
    next();
  } catch (error: any) {
    console.error(`[Auth] Unauthorized access attempt to ${req.originalUrl}:`, error.message);
    return ErrorHandler.handleError(
      new ApiError(401, error.message || "Unauthorized"),
      req,
      res
    );
  }
}
