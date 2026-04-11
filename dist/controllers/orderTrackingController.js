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
exports.trackOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
const db_1 = require("../config/db");
/**
 * Public Order Tracking Controller
 * Allows customers to track their orders using Order Number or ID
 */
const trackOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        // Ensure database connection
        yield (0, db_1.ensureMongooseConnected)();
        // Get order identifier from params, query, or body
        let orderId = String(req.params.id ||
            req.query.id ||
            req.params.orderNumber ||
            req.query.orderNumber ||
            "").trim();
        if (!orderId) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Order Number or ID is required"), req, res);
        }
        // Sanitize: remove any surrounding quotes
        orderId = orderId.replace(/['"]+/g, '');
        let order;
        // 1. Try finding by orderNumber first (Cleanest search)
        order = yield Order_1.default.findOne({ orderNumber: orderId }).lean();
        // 2. If not found and it looks like a valid MongoDB ObjectId, try findById
        if (!order && mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            try {
                order = yield Order_1.default.findById(orderId).lean();
            }
            catch (err) {
                console.error("[Tracking] ObjectId search error:", err);
            }
        }
        if (!order) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(404, "Order not found. Please check your tracking number."), req, res);
        }
        // Filter sensitive data before returning to public
        const publicData = {
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: ((_a = order.payment) === null || _a === void 0 ? void 0 : _a.status) || "pending",
            amount: ((_b = order.payment) === null || _b === void 0 ? void 0 : _b.amount) || 0,
            currency: (((_c = order.payment) === null || _c === void 0 ? void 0 : _c.currency) || "inr").toUpperCase(),
            customer: {
                name: (_d = order.customer) === null || _d === void 0 ? void 0 : _d.name,
                email: (_e = order.customer) === null || _e === void 0 ? void 0 : _e.email,
                phone: (_f = order.customer) === null || _f === void 0 ? void 0 : _f.phone
            },
            items: (_g = order.items) === null || _g === void 0 ? void 0 : _g.map((item) => ({
                productName: item.productName || item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                variant: item.variant,
                customization: item.customization ? {
                    color: item.customization.color,
                    colorName: item.customization.colorName,
                    designPosition: item.customization.designPosition,
                    designScale: item.customization.designScale,
                    originalDesign: item.customization.originalDesign
                } : undefined
            })),
            fulfillment: order.fulfillment,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };
        return SuccessHandler_1.SuccessHandler.handle(res, "Order status retrieved successfully", publicData, 200);
    }
    catch (error) {
        console.error("[Tracking Error]:", error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message || "Internal server error during tracking"), req, res);
    }
});
exports.trackOrder = trackOrder;
//# sourceMappingURL=orderTrackingController.js.map