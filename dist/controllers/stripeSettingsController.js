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
const stripe_1 = __importDefault(require("stripe"));
const StripeSettings_1 = __importDefault(require("../models/StripeSettings"));
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const MASK_PLACEHOLDER = "****";
function isMaskedSecret(value) {
    return !value || value.includes(MASK_PLACEHOLDER) || value.length < 12;
}
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
                currency: "inr",
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
        if (!publishableKey || typeof publishableKey !== "string") {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Publishable key is required"), req, res);
        }
        if (!publishableKey.startsWith("pk_")) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Invalid publishable key format (must start with pk_)"), req, res);
        }
        let settings = yield StripeSettings_1.default.findOne();
        const useNewSecret = secretKey &&
            typeof secretKey === "string" &&
            !isMaskedSecret(secretKey) &&
            secretKey.startsWith("sk_");
        if (!settings) {
            if (!useNewSecret) {
                return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Secret key is required when creating settings"), req, res);
            }
            settings = yield StripeSettings_1.default.create({
                publishableKey: publishableKey.trim(),
                secretKey: secretKey.trim(),
                webhookSecret: (webhookSecret && typeof webhookSecret === "string") ? webhookSecret.trim() : "",
                isActive: isActive === true,
                currency: currency && typeof currency === "string" ? currency.toLowerCase() : "inr",
                updatedBy: "admin",
            });
        }
        else {
            settings.publishableKey = publishableKey.trim();
            if (useNewSecret) {
                settings.secretKey = secretKey.trim();
            }
            if (webhookSecret !== undefined) {
                settings.webhookSecret =
                    typeof webhookSecret === "string" ? webhookSecret.trim() : "";
            }
            if (typeof isActive === "boolean") {
                settings.isActive = isActive;
            }
            if (currency && typeof currency === "string") {
                settings.currency = currency.toLowerCase();
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
    var _a, _b, _c;
    try {
        yield ensureMongooseConnected();
        const settings = yield StripeSettings_1.default.findOne();
        if (!settings || !settings.secretKey || settings.secretKey.length < 12) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Stripe settings not configured. Save your secret key first."), req, res);
        }
        const stripe = new stripe_1.default(settings.secretKey);
        const account = yield stripe.accounts.retrieve();
        return SuccessHandler_1.SuccessHandler.handle(res, "Stripe connection test successful", {
            connected: true,
            accountId: account.id,
            email: (_a = account.email) !== null && _a !== void 0 ? _a : undefined,
            country: (_b = account.country) !== null && _b !== void 0 ? _b : undefined,
        }, 200);
    }
    catch (error) {
        const message = (error === null || error === void 0 ? void 0 : error.message) || ((_c = error === null || error === void 0 ? void 0 : error.raw) === null || _c === void 0 ? void 0 : _c.message) || "Stripe connection failed";
        console.error("Test Stripe connection error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, `Stripe connection failed: ${message}`), req, res);
    }
});
exports.testStripeConnection = testStripeConnection;
//# sourceMappingURL=stripeSettingsController.js.map