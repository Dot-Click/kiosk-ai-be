"use strict";
// import { Request, Response, NextFunction } from "express";
// import validator from "validator";
// import ErrorHandler from "../utils/ErrorHandler";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuth = void 0;
const validator_1 = __importDefault(require("validator"));
const validateAuth = (type) => (req, res, next) => {
    const { first_name, last_name, email, password } = req.body;
    // Validation for register
    if (type === "register") {
        if (!first_name || first_name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "First name is required"
            });
        }
        if (!last_name || last_name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Last name is required"
            });
        }
    }
    // Common validation for both login and register
    if (!email || email.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }
    if (!validator_1.default.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }
    if (!password || password.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Password is required"
        });
    }
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long"
        });
    }
    next();
};
exports.validateAuth = validateAuth;
//# sourceMappingURL=authValidator.js.map