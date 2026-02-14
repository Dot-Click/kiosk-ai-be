import { Router } from "express";
import * as payment from "../controllers/paymentController";

const router = Router();

/**
 * @swagger
 * /stripe-config:
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
router.get("/stripe-config", payment.getPublicStripeConfig);

/**
 * @swagger
 * /payment/create-payment-intent:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Create Stripe Payment Intent
 *     description: Creates a Stripe Payment Intent for checkout. Returns clientSecret for Stripe Elements.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/CreatePaymentIntentRequest'
 *     responses:
 *       200:
 *         description: Payment intent created
 *         schema:
 *           $ref: '#/definitions/CreatePaymentIntentResponse'
 *       400:
 *         description: Bad request
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *       500:
 *         description: Server error
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.post("/payment/create-payment-intent", payment.createPaymentIntent);

export default router;
