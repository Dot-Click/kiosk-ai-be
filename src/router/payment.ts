import { Router } from "express";
import * as payment from "../controllers/paymentController";

const router = Router();

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

export default router;
