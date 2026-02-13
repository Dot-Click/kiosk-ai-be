import { Request, Response } from "express";
import StripeSettings from "../models/StripeSettings";
import { SuccessHandler } from "../utils/SuccessHandler";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";
import mongoose from "mongoose";

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

    // Validation
    if (!publishableKey || !secretKey) {
      return ErrorHandler.handleError(
        new ApiError(400, "Publishable key and secret key are required"),
        req,
        res
      );
    }

    // Validate publishable key format (starts with pk_)
    if (!publishableKey.startsWith("pk_")) {
      return ErrorHandler.handleError(
        new ApiError(400, "Invalid publishable key format"),
        req,
        res
      );
    }

    // Validate secret key format (starts with sk_)
    if (!secretKey.startsWith("sk_")) {
      return ErrorHandler.handleError(
        new ApiError(400, "Invalid secret key format"),
        req,
        res
      );
    }

    // Find or create settings
    let settings = await StripeSettings.findOne();

    if (!settings) {
      settings = await StripeSettings.create({
        publishableKey,
        secretKey,
        webhookSecret: webhookSecret || "",
        isActive: isActive !== undefined ? isActive : false,
        currency: currency || "usd",
        updatedBy: "admin",
      });
    } else {
      // Update existing settings
      settings.publishableKey = publishableKey;
      settings.secretKey = secretKey;
      if (webhookSecret !== undefined) {
        settings.webhookSecret = webhookSecret;
      }
      if (isActive !== undefined) {
        settings.isActive = isActive;
      }
      if (currency) {
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

    if (!settings || !settings.secretKey) {
      return ErrorHandler.handleError(
        new ApiError(400, "Stripe settings not configured"),
        req,
        res
      );
    }

    // Test connection using Stripe API
    // Note: Install stripe package: npm install stripe
    try {
      let stripe;
      try {
        stripe = require("stripe");
      } catch (requireError) {
        return ErrorHandler.handleError(
          new ApiError(
            500,
            "Stripe package not installed. Run: npm install stripe"
          ),
          req,
          res
        );
      }

      const stripeClient = stripe(settings.secretKey);
      const account = await stripeClient.account.retrieve();

      return SuccessHandler.handle(
        res,
        "Stripe connection test successful",
        {
          connected: true,
          accountId: account.id,
          email: account.email,
          country: account.country,
        },
        200
      );
    } catch (stripeError: any) {
      return ErrorHandler.handleError(
        new ApiError(400, `Stripe connection failed: ${stripeError.message}`),
        req,
        res
      );
    }
  } catch (error: any) {
    console.error("Test Stripe connection error:", error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message || "Failed to test Stripe connection"),
      req,
      res
    );
  }
};
