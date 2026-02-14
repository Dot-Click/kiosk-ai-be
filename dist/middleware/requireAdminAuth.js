"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminAuth = requireAdminAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ErrorHandler_1 = require("../utils/ErrorHandler");
/**
 * Requires valid admin JWT. Use on routes under /api/admin.
 */
function requireAdminAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(401, "Unauthorized"), req, res);
        }
        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, "Server configuration error"), req, res);
        }
        jsonwebtoken_1.default.verify(token, secret);
        next();
    }
    catch (_a) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(401, "Unauthorized"), req, res);
    }
}
//# sourceMappingURL=requireAdminAuth.js.map