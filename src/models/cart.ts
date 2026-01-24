import { Schema, model, Document, Types } from "mongoose";
import { IProduct } from "./product";

/* ENUMS */
export enum Rotation {
    RIGHT = "RIGHT",
    LEFT = "LEFT",
}

export enum PaymentStatus {
    PAID = "PAID",
    PENDING = "PENDING",
    CANCELLED = "CANCELLED",
}

export const ALLOWED_COLORS = [
    "#FF3A02",
    "#F7C223",
    "#8F00FF",
    "#A855F7",
    "#FBBF24",
    "#CD7F32",
    "#00B5AD",
    "#954535",
] as const;

/* INTERFACE */
export interface ICart extends Document {
    user: Types.ObjectId;              // Added user field
    product: Types.ObjectId | IProduct;
    totalPrice: number;
    totalQuantity: number;
    tax: number;
    rotation: Rotation;
    scale: string;
    color: (typeof ALLOWED_COLORS)[number];
    imageUrl: string;
    paymentStatus: PaymentStatus;
}

/* SCHEMA */
const CartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        totalPrice: { type: Number, required: true, min: 0 },
        totalQuantity: { type: Number, required: true, min: 1 },
        tax: { type: Number, required: true, min: 0 },
        rotation: { type: String, enum: Object.values(Rotation), required: true },
        scale: { type: String, required: true, trim: true },
        color: { type: String, enum: ALLOWED_COLORS, required: true },
        imageUrl: { type: String, required: true, trim: true },
        paymentStatus: { type: String, enum: Object.values(PaymentStatus), required: true, default: PaymentStatus.PENDING },
    },
    { timestamps: true }
);

/* MODEL */
export const CartModel = model<ICart>("Cart", CartSchema);
