import { Request, Response } from "express";
import Stripe from "stripe";
import StripeSettings from "../models/StripeSettings";
import Order from "../models/Order";
import { SuccessHandler } from "../utils/SuccessHandler";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";
import mongoose from "mongoose";

export interface StripePaymentConfig {
  secretKey: string;
  publishableKey: string;
  currency: string;
  isActive: boolean;
}

async function ensureMongooseConnected() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2) {
    return new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("Mongoose connection timeout")), 10000);
      mongoose.connection.once("connected", () => { clearTimeout(t); resolve(); });
      mongoose.connection.once("error", (err) => { clearTimeout(t); reject(err); });
    });
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  await mongoose.connect(uri, { dbName: "kiosk-ai", serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
}

export async function getStripeConfig(): Promise<StripePaymentConfig | null> {
  try {
    await ensureMongooseConnected();
    const settings = await StripeSettings.findOne();
    if (
      settings &&
      settings.secretKey?.length > 20 &&
      settings.publishableKey?.length > 20 &&
      settings.secretKey.startsWith("sk_") &&
      settings.publishableKey.startsWith("pk_")
    ) {
      return {
        secretKey: settings.secretKey,
        publishableKey: settings.publishableKey,
        currency: settings.currency || "usd",
        isActive: settings.isActive ?? false,
      };
    }
  } catch {
    // ignore DB errors, fall back to env
  }
  const secret = process.env.STRIPE_SECRET_KEY;
  const publishable = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!secret || !publishable || !secret.startsWith("sk_") || !publishable.startsWith("pk_")) {
    return null;
  }
  return {
    secretKey: secret,
    publishableKey: publishable,
    currency: (process.env.STRIPE_CURRENCY || "usd").toLowerCase(),
    isActive: true,
  };
}

export const getPublicStripeConfig = async (req: Request, res: Response) => {
  try {
    const config = await getStripeConfig();
    if (!config) {
      return SuccessHandler.handle(
        res,
        "Stripe not configured",
        { publishableKey: "", currency: "usd", isActive: false },
        200
      );
    }
    return SuccessHandler.handle(
      res,
      "Stripe config",
      {
        publishableKey: config.publishableKey,
        currency: config.currency,
        isActive: config.isActive,
      },
      200
    );
  } catch (error: any) {
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Failed to get Stripe config"),
      req,
      res
    );
  }
};

/**
 * Create Checkout Session (Hosted Page)
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const config = await getStripeConfig();
    if (!config || !config.isActive) {
      return ErrorHandler.handleError(
        new ApiError(503, "Stripe is not configured. Please check admin settings."),
        req,
        res
      );
    }

    const { items, customer, fulfillment } = req.body;
    // items: [{ name, quantity, price (in cents), image? }]

    const stripe = new Stripe(config.secretKey);
    const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: config.currency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price), // stored as cents
      },
      quantity: item.quantity,
    }));

    // Add shipping if Doorstep
    if (fulfillment.method === "doorstep") {
      lineItems.push({
        price_data: {
          currency: config.currency,
          product_data: {
            name: "Doorstep Delivery Status",
          },
          unit_amount: 500, // $5.00
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/failed`,
      customer_email: customer.email || undefined,
      metadata: {
        customerName: customer.name,
        customerPhone: customer.phone,
        fulfillmentMethod: fulfillment.method,
        addressStreet: fulfillment.address?.street || "",
        addressCity: fulfillment.address?.city || "",
        addressZip: fulfillment.address?.zip || "",
      },
    });

    return SuccessHandler.handle(
      res,
      "Checkout session created",
      { url: session.url, sessionId: session.id },
      200
    );
  } catch (error: any) {
    console.error("Create session error:", error);
    return ErrorHandler.handleError(
      new ApiError(400, `Payment error: ${error.message}`),
      req,
      res
    );
  }
};

/**
 * Verify Session & Create Order
 * Called by frontend on Success page to confirm payment and save order
 */
const verifySession = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();
    const { sessionId } = req.body;

    if (!sessionId) {
      return ErrorHandler.handleError(new ApiError(400, "Session ID required"), req, res);
    }

    const config = await getStripeConfig();
    if (!config) throw new Error("Stripe not configured");

    const stripe = new Stripe(config.secretKey);
    // Expand payment_intent to get the ID
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return ErrorHandler.handleError(new ApiError(400, "Payment not verified"), req, res);
    }

    // Check if order already exists
    let order = await Order.findOne({ "payment.stripeSessionId": sessionId });

    if (!order) {
      // Create New Order
      const metadata = session.metadata || {};

      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      const orderItems = lineItems.data.map(li => ({
        productName: li.description,
        quantity: li.quantity,
        price: li.amount_total / 100, // convert back to standard unit
      }));

      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent as Stripe.PaymentIntent)?.id;

      order = new Order({
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        customer: {
          name: metadata.customerName,
          email: session.customer_details?.email || metadata.customerEmail,
          phone: metadata.customerPhone,
        },
        items: orderItems,
        fulfillment: {
          method: metadata.fulfillmentMethod,
          address: metadata.fulfillmentMethod === 'doorstep' ? {
            street: metadata.addressStreet,
            city: metadata.addressCity,
            zip: metadata.addressZip,
          } : undefined
        },
        payment: {
          stripeSessionId: sessionId,
          paymentIntentId: paymentIntentId || undefined, // undefined to avoid null index issues if index still exists
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
          status: 'paid'
        },
        status: 'pending' // Ready for processing
      });

      await order.save();
    }

    return SuccessHandler.handle(res, "Order verified", order, 200);

  } catch (error: any) {
    console.error("Verify session error:", error);
    // Check for duplicate key error specifically
    if (error.code === 11000) {
      // Retrieve the existing order and return it
      const existingOrder = await Order.findOne({ "payment.stripeSessionId": req.body.sessionId });
      if (existingOrder) {
        return SuccessHandler.handle(res, "Order verified (retrieved existing)", existingOrder, 200);
      }
    }
    return ErrorHandler.handleError(new ApiError(500, error.message), req, res);
  }
}

export { verifySession };
