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
exports.createPaymentIntent = exports.getPublicStripeConfig = void 0;
exports.getStripeConfig = getStripeConfig;
const stripe_1 = __importDefault(require("stripe"));
const StripeSettings_1 = __importDefault(require("../models/StripeSettings"));
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
function ensureMongooseConnected() {
    return __awaiter(this, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState === 1)
            return;
        if (mongoose_1.default.connection.readyState === 2) {
            return new Promise((resolve, reject) => {
                const t = setTimeout(() => reject(new Error("Mongoose connection timeout")), 10000);
                mongoose_1.default.connection.once("connected", () => { clearTimeout(t); resolve(); });
                mongoose_1.default.connection.once("error", (err) => { clearTimeout(t); reject(err); });
            });
        }
        const uri = process.env.MONGODB_URI;
        if (!uri)
            throw new Error("MONGODB_URI not set");
        yield mongoose_1.default.connect(uri, { dbName: "kiosk-ai", serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
    });
}
/**
 * Get Stripe config: from DB (StripeSettings) if present and valid, else from env.
 * Env: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_CURRENCY (optional, default usd).
 */
function getStripeConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            yield ensureMongooseConnected();
            const settings = yield StripeSettings_1.default.findOne();
            if (settings &&
                ((_a = settings.secretKey) === null || _a === void 0 ? void 0 : _a.length) > 20 &&
                ((_b = settings.publishableKey) === null || _b === void 0 ? void 0 : _b.length) > 20 &&
                settings.secretKey.startsWith("sk_") &&
                settings.publishableKey.startsWith("pk_")) {
                return {
                    secretKey: settings.secretKey,
                    publishableKey: settings.publishableKey,
                    currency: settings.currency || "usd",
                    isActive: (_c = settings.isActive) !== null && _c !== void 0 ? _c : false,
                };
            }
        }
        catch (_d) {
            // ignore DB errors, fall back to env
        }
        const secret = process.env.STRIPE_SECRET_KEY;
        const publishable = process.env.STRIPE_PUBLISHABLE_KEY;
        if (!secret || !publishable || !secret.startsWith("sk_") || !publishable.startsWith("pk_")) {
            return null;
        }
        return {
            secretKey: secret,
            publishableKey: publishable,
            currency: (process.env.STRIPE_CURRENCY || "usd").toLowerCase(),
            isActive: true,
        };
    });
}
/**
 * GET /api/stripe-config — public, for checkout. Returns publishableKey, currency, isActive.
 */
const getPublicStripeConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = yield getStripeConfig();
        if (!config) {
            return SuccessHandler_1.SuccessHandler.handle(res, "Stripe not configured", { publishableKey: "", currency: "usd", isActive: false }, 200);
        }
        return SuccessHandler_1.SuccessHandler.handle(res, "Stripe config", {
            publishableKey: config.publishableKey,
            currency: config.currency,
            isActive: config.isActive,
        }, 200);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Failed to get Stripe config"), req, res);
    }
});
exports.getPublicStripeConfig = getPublicStripeConfig;
/**
 * POST /api/payment/create-payment-intent
 * Body: { amountInCents: number, currency?: string, metadata?: object }
 * Returns: { clientSecret: string }
 */
const createPaymentIntent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const config = yield getStripeConfig();
        if (!config || !config.isActive) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(503, "Stripe is not configured or not active. Configure it in Admin → Stripe Settings or set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env."), req, res);
        }
        const { amountInCents, currency, metadata } = req.body;
        const amount = Math.round(Number(amountInCents));
        if (!Number.isFinite(amount) || amount < 50) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "amountInCents must be at least 50 (0.50)"), req, res);
        }
        const stripe = new stripe_1.default(config.secretKey);
        const intent = yield stripe.paymentIntents.create({
            amount,
            currency: currency || config.currency,
            automatic_payment_methods: { enabled: true },
            metadata: typeof metadata === "object" && metadata !== null ? metadata : undefined,
        });
        return SuccessHandler_1.SuccessHandler.handle(res, "Payment intent created", { clientSecret: intent.client_secret }, 200);
    }
    catch (error) {
        const msg = (error === null || error === void 0 ? void 0 : error.message) || ((_a = error === null || error === void 0 ? void 0 : error.raw) === null || _a === void 0 ? void 0 : _a.message) || "Failed to create payment intent";
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, `Payment error: ${msg}`), req, res);
    }
});
exports.createPaymentIntent = createPaymentIntent;
//# sourceMappingURL=paymentController.js.map