"use strict";
// import { Request, Response } from "express";
// import User, { IUser } from "../models/User/user";
// import SuccessHandler from "../utils/SuccessHandler";
// import ErrorHandler from "../utils/ErrorHandler";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const user_1 = __importDefault(require("../models/User/user"));
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
// Register
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "All fields are required"), req, res);
        }
        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=]).{6,}$/)) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Password must contain at least one uppercase letter, one special character, and one number"), req, res);
        }
        const user = yield user_1.default.findOne({ email });
        if (user) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "User already exists"), req, res);
        }
        const newUser = yield user_1.default.create({
            first_name,
            last_name,
            email,
            password,
        });
        yield newUser.save();
        return SuccessHandler_1.SuccessHandler.handle(res, "User created successfully", {
            id: newUser._id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email
        }, 201);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), req, res);
    }
});
exports.register = register;
// Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Email and password are required"), req, res);
        }
        const user = yield user_1.default.findOne({ email }).select("+password");
        if (!user) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "User does not exist"), req, res);
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Invalid credentials"), req, res);
        }
        const jwtToken = user.getJWTToken();
        return SuccessHandler_1.SuccessHandler.handle(res, "Logged in successfully", {
            jwtToken,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        }, 200);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), req, res);
    }
});
exports.login = login;
// Logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.user = undefined;
        return SuccessHandler_1.SuccessHandler.handle(res, "Logged out successfully", null, 200);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), req, res);
    }
});
exports.logout = logout;
//# sourceMappingURL=authController.js.map