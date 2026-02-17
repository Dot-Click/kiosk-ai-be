"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment = __importStar(require("../controllers/paymentController"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * /payment/config:
 *   get:
 *     tags:
 *       - Payment
 *     summary: Get public Stripe config
 *     description: Returns publishable key, currency, and active status for checkout (no auth required).
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Stripe config retrieved
 *         schema:
 *           $ref: '#/definitions/StripeConfigResponse'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.get("/config", payment.getPublicStripeConfig);
/**
 * @swagger
 * /payment/create-session:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Create Stripe Checkout Session
 *     description: Creates a hosted Stripe Checkout Session and returns the URL.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   quantity: { type: number }
 *                   price: { type: number }
 *                   image: { type: string }
 *             customer:
 *               type: object
 *               properties:
 *                 name: { type: string }
 *                 email: { type: string }
 *                 phone: { type: string }
 *             fulfillment:
 *               type: object
 *               properties:
 *                 method: { type: string }
 *                 address: { type: object }
 *     responses:
 *       200:
 *         description: Session created
 *         schema:
 *           type: object
 *           properties:
 *             success: { type: boolean }
 *             data:
 *               type: object
 *               properties:
 *                 url: { type: string }
 *                 sessionId: { type: string }
 *       500:
 *         description: Server error
 */
router.post("/create-session", payment.createCheckoutSession);
/**
 * @swagger
 * /payment/verify-session:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Verify Session & Create Order
 *     description: Verifies a successful Stripe session and creates the order in DB.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             sessionId: { type: string }
 *     responses:
 *       200:
 *         description: Order verified and created
 */
router.post("/verify-session", payment.verifySession);
exports.default = router;
//# sourceMappingURL=payment.js.map