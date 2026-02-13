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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripeSettings = __importStar(require("../controllers/stripeSettingsController"));
const router = express_1.default.Router();
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
exports.default = router;
//# sourceMappingURL=stripeSettings.js.map