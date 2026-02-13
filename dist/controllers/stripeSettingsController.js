"use strict";
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
exports.testStripeConnection = exports.updateStripeSettings = exports.getStripeSettings = void 0;
const StripeSettings_1 = __importDefault(require("../models/StripeSettings"));
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
// Helper function to ensure Mongoose is connected
function ensureMongooseConnected() {
    return __awaiter(this, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState === 1) {
            return;
        }
        if (mongoose_1.default.connection.readyState === 2) {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Mongoose connection timeout"));
                }, 10000);
                mongoose_1.default.connection.once("connected", () => {
                    clearTimeout(timeout);
                    resolve();
                });
                mongoose_1.default.connection.once("error", (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });
        }
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI not set");
        }
        yield mongoose_1.default.connect(mongoUri, {
            dbName: "kiosk-ai",
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
    });
}
// Get Stripe Settings
const getStripeSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureMongooseConnected();
        let settings = yield StripeSettings_1.default.findOne();
        // If no settings exist, create default one
        if (!settings) {
            settings = yield StripeSettings_1.default.create({
                publishableKey: "",
                secretKey: "",
                isActive: false,
                currency: "usd",
                updatedBy: "admin",
            });
        }
        // Return settings without exposing full secret key (mask it)
        const maskedSecretKey = settings.secretKey.length > 8
            ? `${settings.secretKey.substring(0, 4)}****${settings.secretKey.substring(settings.secretKey.length - 4)}`
            : "****";
        return SuccessHandler_1.SuccessHandler.handle(res, "Stripe settings retrieved successfully", {
            id: settings._id,
            publishableKey: settings.publishableKey,
            secretKey: maskedSecretKey, // Masked for security
            webhookSecret: settings.webhookSecret || "",
            isActive: settings.isActive,
            currency: settings.currency,
            updatedAt: settings.updatedAt,
            updatedBy: settings.updatedBy,
        }, 200);
    }
    catch (error) {
        console.error("Get Stripe settings error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Failed to retrieve Stripe settings"), req, res);
    }
});
exports.getStripeSettings = getStripeSettings;
// Update Stripe Settings
const updateStripeSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureMongooseConnected();
        const { publishableKey, secretKey, webhookSecret, isActive, currency, } = req.body;
        // Validation
        if (!publishableKey || !secretKey) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Publishable key and secret key are required"), req, res);
        }
        // Validate publishable key format (starts with pk_)
        if (!publishableKey.startsWith("pk_")) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Invalid publishable key format"), req, res);
        }
        // Validate secret key format (starts with sk_)
        if (!secretKey.startsWith("sk_")) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Invalid secret key format"), req, res);
        }
        // Find or create settings
        let settings = yield StripeSettings_1.default.findOne();
        if (!settings) {
            settings = yield StripeSettings_1.default.create({
                publishableKey,
                secretKey,
                webhookSecret: webhookSecret || "",
                isActive: isActive !== undefined ? isActive : false,
                currency: currency || "usd",
                updatedBy: "admin",
            });
        }
        else {
            // Update existing settings
            settings.publishableKey = publishableKey;
            settings.secretKey = secretKey;
            if (webhookSecret !== undefined) {
                settings.webhookSecret = webhookSecret;
            }
            if (isActive !== undefined) {
                settings.isActive = isActive;
            }
            if (currency) {
                settings.currency = currency;
            }
            settings.updatedBy = "admin";
            yield settings.save();
        }
        // Return updated settings with masked secret key
        const maskedSecretKey = settings.secretKey.length > 8
            ? `${settings.secretKey.substring(0, 4)}****${settings.secretKey.substring(settings.secretKey.length - 4)}`
            : "****";
        return SuccessHandler_1.SuccessHandler.handle(res, "Stripe settings updated successfully", {
            id: settings._id,
            publishableKey: settings.publishableKey,
            secretKey: maskedSecretKey,
            webhookSecret: settings.webhookSecret || "",
            isActive: settings.isActive,
            currency: settings.currency,
            updatedAt: settings.updatedAt,
            updatedBy: settings.updatedBy,
        }, 200);
    }
    catch (error) {
        console.error("Update Stripe settings error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Failed to update Stripe settings"), req, res);
    }
});
exports.updateStripeSettings = updateStripeSettings;
// Test Stripe Connection
const testStripeConnection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureMongooseConnected();
        const settings = yield StripeSettings_1.default.findOne();
        if (!settings || !settings.secretKey) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Stripe settings not configured"), req, res);
        }
        // Test connection using Stripe API
        // Note: Install stripe package: npm install stripe
        try {
            let stripe;
            try {
                stripe = require("stripe");
            }
            catch (requireError) {
                return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, "Stripe package not installed. Run: npm install stripe"), req, res);
            }
            const stripeClient = stripe(settings.secretKey);
            const account = yield stripeClient.account.retrieve();
            return SuccessHandler_1.SuccessHandler.handle(res, "Stripe connection test successful", {
                connected: true,
                accountId: account.id,
                email: account.email,
                country: account.country,
            }, 200);
        }
        catch (stripeError) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, `Stripe connection failed: ${stripeError.message}`), req, res);
        }
    }
    catch (error) {
        console.error("Test Stripe connection error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Failed to test Stripe connection"), req, res);
    }
});
exports.testStripeConnection = testStripeConnection;
//# sourceMappingURL=stripeSettingsController.js.map