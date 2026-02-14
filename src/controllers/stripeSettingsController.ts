import { Request, Response } from "express";
import Stripe from "stripe";
import StripeSettings from "../models/StripeSettings";
import { SuccessHandler } from "../utils/SuccessHandler";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";
import mongoose from "mongoose";

const MASK_PLACEHOLDER = "****";
function isMaskedSecret(value: string): boolean {
  return !value || value.includes(MASK_PLACEHOLDER) || value.length < 12;
}

// Helper function to ensure Mongoose is connected
async function ensureMongooseConnected() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (mongoose.connection.readyState === 2) {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Mongoose connection timeout"));
      }, 10000);
      mongoose.connection.once("connected", () => {
        clearTimeout(timeout);
        resolve();
      });
      mongoose.connection.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI not set");
  }
  await mongoose.connect(mongoUri, {
    dbName: "kiosk-ai",
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
}

// Get Stripe Settings
export const getStripeSettings = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();

    let settings = await StripeSettings.findOne();

    // If no settings exist, create default one
    if (!settings) {
      settings = await StripeSettings.create({
        publishableKey: "",
        secretKey: "",
        isActive: false,
        currency: "usd",
        updatedBy: "admin",
      });
    }

    // Return settings without exposing full secret key (mask it)
    const maskedSecretKey =
      settings.secretKey.length > 8
        ? `${settings.secretKey.substring(0, 4)}****${settings.secretKey.substring(
            settings.secretKey.length - 4
          )}`
        : "****";

    return SuccessHandler.handle(
      res,
      "Stripe settings retrieved successfully",
      {
        id: settings._id,
        publishableKey: settings.publishableKey,
        secretKey: maskedSecretKey, // Masked for security
        webhookSecret: settings.webhookSecret || "",
        isActive: settings.isActive,
        currency: settings.currency,
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      },
      200
    );
  } catch (error: any) {
    console.error("Get Stripe settings error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Failed to retrieve Stripe settings"),
      req,
      res
    );
  }
};

// Update Stripe Settings
export const updateStripeSettings = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();

    const {
      publishableKey,
      secretKey,
      webhookSecret,
      isActive,
      currency,
    } = req.body;

    if (!publishableKey || typeof publishableKey !== "string") {
      return ErrorHandler.handleError(
        new ApiError(400, "Publishable key is required"),
        req,
        res
      );
    }

    if (!publishableKey.startsWith("pk_")) {
      return ErrorHandler.handleError(
        new ApiError(400, "Invalid publishable key format (must start with pk_)"),
        req,
        res
      );
    }

    let settings = await StripeSettings.findOne();

    const useNewSecret =
      secretKey &&
      typeof secretKey === "string" &&
      !isMaskedSecret(secretKey) &&
      secretKey.startsWith("sk_");

    if (!settings) {
      if (!useNewSecret) {
        return ErrorHandler.handleError(
          new ApiError(400, "Secret key is required when creating settings"),
          req,
          res
        );
      }
      settings = await StripeSettings.create({
        publishableKey: publishableKey.trim(),
        secretKey: secretKey.trim(),
        webhookSecret: (webhookSecret && typeof webhookSecret === "string") ? webhookSecret.trim() : "",
        isActive: isActive === true,
        currency: currency && ["usd", "eur", "gbp", "cad", "aud"].includes(currency) ? currency : "usd",
        updatedBy: "admin",
      });
    } else {
      settings.publishableKey = publishableKey.trim();
      if (useNewSecret) {
        settings.secretKey = secretKey.trim();
      }
      if (webhookSecret !== undefined) {
        settings.webhookSecret =
          typeof webhookSecret === "string" ? webhookSecret.trim() : "";
      }
      if (typeof isActive === "boolean") {
        settings.isActive = isActive;
      }
      if (currency && ["usd", "eur", "gbp", "cad", "aud"].includes(currency)) {
        settings.currency = currency;
      }
      settings.updatedBy = "admin";
      await settings.save();
    }

    // Return updated settings with masked secret key
    const maskedSecretKey =
      settings.secretKey.length > 8
        ? `${settings.secretKey.substring(0, 4)}****${settings.secretKey.substring(
            settings.secretKey.length - 4
          )}`
        : "****";

    return SuccessHandler.handle(
      res,
      "Stripe settings updated successfully",
      {
        id: settings._id,
        publishableKey: settings.publishableKey,
        secretKey: maskedSecretKey,
        webhookSecret: settings.webhookSecret || "",
        isActive: settings.isActive,
        currency: settings.currency,
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      },
      200
    );
  } catch (error: any) {
    console.error("Update Stripe settings error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Failed to update Stripe settings"),
      req,
      res
    );
  }
};

// Test Stripe Connection
export const testStripeConnection = async (req: Request, res: Response) => {
  try {
    await ensureMongooseConnected();

    const settings = await StripeSettings.findOne();

    if (!settings || !settings.secretKey || settings.secretKey.length < 12) {
      return ErrorHandler.handleError(
        new ApiError(400, "Stripe settings not configured. Save your secret key first."),
        req,
        res
      );
    }

    const stripe = new Stripe(settings.secretKey);
    const account = await stripe.accounts.retrieve();

    return SuccessHandler.handle(
      res,
      "Stripe connection test successful",
      {
        connected: true,
        accountId: account.id,
        email: account.email ?? undefined,
        country: account.country ?? undefined,
      },
      200
    );
  } catch (error: any) {
    const message =
      error?.message || error?.raw?.message || "Stripe connection failed";
    console.error("Test Stripe connection error:", error);
    return ErrorHandler.handleError(
      new ApiError(400, `Stripe connection failed: ${message}`),
      req,
      res
    );
  }
};
