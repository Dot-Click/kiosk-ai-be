import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import { SuccessHandler } from "../utils/SuccessHandler";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";
import { ensureMongooseConnected } from "../config/db";

/**
 * Public Order Tracking Controller
 * Allows customers to track their orders using Order Number or ID
 */
export const trackOrder = async (req: Request, res: Response) => {
  try {
    // Ensure database connection
    await ensureMongooseConnected();

    // Get order identifier from params, query, or body
    let orderId = String(
      req.params.id ||
      req.query.id ||
      req.params.orderNumber ||
      req.query.orderNumber ||
      ""
    ).trim();

    if (!orderId) {
      return ErrorHandler.handleError(
        new ApiError(400, "Order Number or ID is required"),
        req,
        res
      );
    }

    // Sanitize: remove any surrounding quotes
    orderId = orderId.replace(/['"]+/g, '');

    let order;

    // 1. Try finding by orderNumber first (Cleanest search)
    order = await Order.findOne({ orderNumber: orderId }).lean();

    // 2. If not found and it looks like a valid MongoDB ObjectId, try findById
    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      try {
        order = await Order.findById(orderId).lean();
      } catch (err) {
        console.error("[Tracking] ObjectId search error:", err);
      }
    }

    if (!order) {
      return ErrorHandler.handleError(
        new ApiError(404, "Order not found. Please check your tracking number."),
        req,
        res
      );
    }

    // Filter sensitive data before returning to public
    const publicData = {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.payment?.status || "pending",
      amount: order.payment?.amount || 0,
      currency: (order.payment?.currency || "inr").toUpperCase(),
      customer: {
        name: order.customer?.name,
        email: order.customer?.email,
        phone: order.customer?.phone
      },
      items: order.items?.map((item: any) => ({
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

    return SuccessHandler.handle(
      res,
      "Order status retrieved successfully",
      publicData,
      200
    );
  } catch (error: any) {
    console.error("[Tracking Error]:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Internal server error during tracking"),
      req,
      res
    );
  }
};
