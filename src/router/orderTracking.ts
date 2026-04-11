import { Router } from "express";
import { trackOrder } from "../controllers/orderTrackingController";

const router = Router();

/**
 * @route   GET /api/v1/track/:orderNumber
 * @desc    Track an order by Order Number or ID
 * @access  Public
 */
router.get("/:orderNumber", trackOrder);

/**
 * @route   GET /api/v1/track
 * @desc    Track an order via query parameter (?orderNumber=XYZ)
 * @access  Public
 */
router.get("/", trackOrder);

export default router;
