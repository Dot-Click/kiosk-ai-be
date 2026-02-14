import { Request, Response } from "express";
import Stripe from "stripe";
import StripeSettings from "../models/StripeSettings";
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

/**
 * Get Stripe config: from DB (StripeSettings) if present and valid, else from env.
 * Env: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_CURRENCY (optional, default usd).
 */
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

/**
 * GET /api/stripe-config — public, for checkout. Returns publishableKey, currency, isActive.
 */
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
 * POST /api/payment/create-payment-intent
 * Body: { amountInCents: number, currency?: string, metadata?: object }
 * Returns: { clientSecret: string }
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const config = await getStripeConfig();
    if (!config || !config.isActive) {
      return ErrorHandler.handleError(
        new ApiError(503, "Stripe is not configured or not active. Configure it in Admin → Stripe Settings or set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env."),
        req,
        res
      );
    }

    const { amountInCents, currency, metadata } = req.body;
    const amount = Math.round(Number(amountInCents));
    if (!Number.isFinite(amount) || amount < 50) {
      return ErrorHandler.handleError(
        new ApiError(400, "amountInCents must be at least 50 (0.50)"),
        req,
        res
      );
    }

    const stripe = new Stripe(config.secretKey);
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: currency || config.currency,
      automatic_payment_methods: { enabled: true },
      metadata: typeof metadata === "object" && metadata !== null ? metadata : undefined,
    });

    return SuccessHandler.handle(
      res,
      "Payment intent created",
      { clientSecret: intent.client_secret },
      200
    );
  } catch (error: any) {
    const msg = error?.message || error?.raw?.message || "Failed to create payment intent";
    return ErrorHandler.handleError(
      new ApiError(400, `Payment error: ${msg}`),
      req,
      res
    );
  }
};
