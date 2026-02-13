import mongoose, { Schema, Document } from "mongoose";

export interface IStripeSettings extends Document {
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
  isActive: boolean;
  currency: string;
  updatedAt: Date;
  updatedBy: string;
}

const stripeSettingsSchema = new Schema<IStripeSettings>(
  {
    publishableKey: {
      type: String,
      required: true,
      trim: true,
    },
    secretKey: {
      type: String,
      required: true,
      trim: true,
    },
    webhookSecret: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: "usd",
      enum: ["usd", "eur", "gbp", "cad", "aud"],
    },
    updatedBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure only one settings document
stripeSettingsSchema.index({}, { unique: true });

const StripeSettings = mongoose.model<IStripeSettings>(
  "StripeSettings",
  stripeSettingsSchema
);

export default StripeSettings;
