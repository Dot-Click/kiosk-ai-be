"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ApiError = void 0;
const logger_1 = require("../functions/logger");
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
class ErrorHandler {
    static handleError(err, req, res) {
        let { statusCode, message } = err;
        if (!statusCode) {
            statusCode = 500;
        }
        if (process.env.NODE_ENV === 'development') {
            logger_1.logger.error(`Error: ${message}`);
            logger_1.logger.error(`Stack: ${err.stack}`);
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
        res.status(statusCode).json(Object.assign({ success: false, message: message || 'Internal Server Error' }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map