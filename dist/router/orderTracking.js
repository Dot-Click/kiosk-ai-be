"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderTrackingController_1 = require("../controllers/orderTrackingController");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/track/:orderNumber
 * @desc    Track an order by Order Number or ID
 * @access  Public
 */
router.get("/:orderNumber", orderTrackingController_1.trackOrder);
/**
 * @route   GET /api/v1/track
 * @desc    Track an order via query parameter (?orderNumber=XYZ)
 * @access  Public
 */
router.get("/", orderTrackingController_1.trackOrder);
exports.default = router;
//# sourceMappingURL=orderTracking.js.map