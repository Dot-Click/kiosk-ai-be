import express, { Router } from "express";
import * as stripeSettings from "../controllers/stripeSettingsController";

const router: Router = express.Router();

/**
 * @swagger
 * /api/admin/stripe-settings:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get Stripe payment settings
 *     description: Retrieve current Stripe payment settings (keys are masked for security)
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Stripe settings retrieved successfully
 *         schema:
 *           $ref: '#/definitions/StripeSettingsResponse'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/").get(stripeSettings.getStripeSettings);

/**
 * @swagger
 * /api/admin/stripe-settings:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update Stripe payment settings
 *     description: Update Stripe payment settings including API keys, webhook secret, and activation status
 *     security:
 *       - Bearer: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Stripe settings update data
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UpdateStripeSettingsRequest'
 *     responses:
 *       200:
 *         description: Stripe settings updated successfully
 *         schema:
 *           $ref: '#/definitions/StripeSettingsResponse'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *       400:
 *         description: Bad request (e.g., invalid key format)
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/").put(stripeSettings.updateStripeSettings);

/**
 * @swagger
 * /api/admin/stripe-settings/test:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Test Stripe connection
 *     description: Test the Stripe API connection using the configured secret key
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Stripe connection test successful
 *         schema:
 *           $ref: '#/definitions/TestStripeConnectionResponse'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *       400:
 *         description: Bad request (e.g., invalid Stripe key)
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/test").post(stripeSettings.testStripeConnection);

export default router;
