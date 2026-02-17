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
exports.verifySession = exports.createCheckoutSession = exports.getPublicStripeConfig = void 0;
exports.getStripeConfig = getStripeConfig;
const stripe_1 = __importDefault(require("stripe"));
const StripeSettings_1 = __importDefault(require("../models/StripeSettings"));
const Order_1 = __importDefault(require("../models/Order"));
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
 * Create Checkout Session (Hosted Page)
 */
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const config = yield getStripeConfig();
        if (!config || !config.isActive) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(503, "Stripe is not configured. Please check admin settings."), req, res);
        }
        const { items, customer, fulfillment } = req.body;
        // items: [{ name, quantity, price (in cents), image? }]
        const stripe = new stripe_1.default(config.secretKey);
        const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";
        const lineItems = items.map((item) => ({
            price_data: {
                currency: config.currency,
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price), // stored as cents
            },
            quantity: item.quantity,
        }));
        // Add shipping if Doorstep
        if (fulfillment.method === "doorstep") {
            lineItems.push({
                price_data: {
                    currency: config.currency,
                    product_data: {
                        name: "Doorstep Delivery Status",
                    },
                    unit_amount: 500, // $5.00
                },
                quantity: 1
            });
        }
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/checkout/failed`,
            customer_email: customer.email || undefined,
            metadata: {
                customerName: customer.name,
                customerPhone: customer.phone,
                fulfillmentMethod: fulfillment.method,
                addressStreet: ((_a = fulfillment.address) === null || _a === void 0 ? void 0 : _a.street) || "",
                addressCity: ((_b = fulfillment.address) === null || _b === void 0 ? void 0 : _b.city) || "",
                addressZip: ((_c = fulfillment.address) === null || _c === void 0 ? void 0 : _c.zip) || "",
            },
        });
        return SuccessHandler_1.SuccessHandler.handle(res, "Checkout session created", { url: session.url, sessionId: session.id }, 200);
    }
    catch (error) {
        console.error("Create session error:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, `Payment error: ${error.message}`), req, res);
    }
});
exports.createCheckoutSession = createCheckoutSession;
/**
 * Verify Session & Create Order
 * Called by frontend on Success page to confirm payment and save order
 */
const verifySession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        yield ensureMongooseConnected();
        const { sessionId } = req.body;
        if (!sessionId) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Session ID required"), req, res);
        }
        const config = yield getStripeConfig();
        if (!config)
            throw new Error("Stripe not configured");
        const stripe = new stripe_1.default(config.secretKey);
        // Expand payment_intent to get the ID
        const session = yield stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["payment_intent"],
        });
        if (session.payment_status !== "paid") {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Payment not verified"), req, res);
        }
        // Check if order already exists
        let order = yield Order_1.default.findOne({ "payment.stripeSessionId": sessionId });
        if (!order) {
            // Create New Order
            const metadata = session.metadata || {};
            const lineItems = yield stripe.checkout.sessions.listLineItems(sessionId);
            const orderItems = lineItems.data.map(li => ({
                productName: li.description,
                quantity: li.quantity,
                price: li.amount_total / 100, // convert back to standard unit
            }));
            const paymentIntentId = typeof session.payment_intent === 'string'
                ? session.payment_intent
                : (_a = session.payment_intent) === null || _a === void 0 ? void 0 : _a.id;
            order = new Order_1.default({
                orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
                customer: {
                    name: metadata.customerName,
                    email: ((_b = session.customer_details) === null || _b === void 0 ? void 0 : _b.email) || metadata.customerEmail,
                    phone: metadata.customerPhone,
                },
                items: orderItems,
                fulfillment: {
                    method: metadata.fulfillmentMethod,
                    address: metadata.fulfillmentMethod === 'doorstep' ? {
                        street: metadata.addressStreet,
                        city: metadata.addressCity,
                        zip: metadata.addressZip,
                    } : undefined
                },
                payment: {
                    stripeSessionId: sessionId,
                    paymentIntentId: paymentIntentId || undefined, // undefined to avoid null index issues if index still exists
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency,
                    status: 'paid'
                },
                status: 'pending' // Ready for processing
            });
            yield order.save();
        }
        return SuccessHandler_1.SuccessHandler.handle(res, "Order verified", order, 200);
    }
    catch (error) {
        console.error("Verify session error:", error);
        // Check for duplicate key error specifically
        if (error.code === 11000) {
            // Retrieve the existing order and return it
            const existingOrder = yield Order_1.default.findOne({ "payment.stripeSessionId": req.body.sessionId });
            if (existingOrder) {
                return SuccessHandler_1.SuccessHandler.handle(res, "Order verified (retrieved existing)", existingOrder, 200);
            }
        }
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), req, res);
    }
});
exports.verifySession = verifySession;
//# sourceMappingURL=paymentController.js.map