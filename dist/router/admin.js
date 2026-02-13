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
const admin = __importStar(require("../controllers/adminController"));
const router = express_1.default.Router();
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin login
 *     description: Authenticate admin user and return JWT token
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Admin login credentials
 *         required: true
 *         schema:
 *           $ref: '#/definitions/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         schema:
 *           $ref: '#/definitions/AdminLoginResponse'
 *       401:
 *         description: Invalid credentials
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/login").post(admin.adminLogin);
/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get dashboard statistics
 *     description: Retrieve dashboard statistics including total orders, payments, and order status counts
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         schema:
 *           $ref: '#/definitions/DashboardStatsResponse'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/dashboard/stats").get(admin.getDashboardStats);
/**
 * @swagger
 * /api/admin/settings/profile:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update admin profile
 *     description: Update admin user profile information (first name, last name, email)
 *     security:
 *       - Bearer: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Profile update data
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         schema:
 *           $ref: '#/definitions/UpdateProfileResponse'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *       400:
 *         description: Bad request (e.g., email already in use)
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/settings/profile").put(admin.updateProfile);
/**
 * @swagger
 * /api/admin/settings/password:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Change admin password
 *     description: Change admin user password with current password verification
 *     security:
 *       - Bearer: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Password change data
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         schema:
 *           $ref: '#/definitions/ChangePasswordResponse'
 *       401:
 *         description: Unauthorized or incorrect current password
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *       400:
 *         description: Bad request (e.g., password too short)
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/settings/password").put(admin.changePassword);
/**
 * @swagger
 * /api/admin/settings/site:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update site settings
 *     description: Update site-wide settings such as site name and URL
 *     security:
 *       - Bearer: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Site settings data
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UpdateSiteSettingsRequest'
 *     responses:
 *       200:
 *         description: Site settings updated successfully
 *         schema:
 *           $ref: '#/definitions/UpdateSiteSettingsResponse'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/settings/site").put(admin.updateSiteSettings);
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get orders list
 *     description: Retrieve list of orders with optional filtering by status and search
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         description: Filter orders by status
 *         required: false
 *         type: string
 *         enum: [all, pending, processing, completed, cancelled]
 *         default: all
 *       - in: query
 *         name: search
 *         description: Search by order number, customer name, or email
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         schema:
 *           $ref: '#/definitions/GetOrdersResponse'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/orders").get(admin.getOrders);
/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get order details
 *     description: Retrieve detailed information about a specific order
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Order ID
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         schema:
 *           $ref: '#/definitions/GetOrderDetailsResponse'
 *       401:
 *         description: Unauthorized
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 *       404:
 *         description: Order not found
 *         schema:
 *           $ref: '#/definitions/ErrorResponse'
 */
router.route("/orders/:id").get(admin.getOrderDetails);
exports.default = router;
//# sourceMappingURL=admin.js.map