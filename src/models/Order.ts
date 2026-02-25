import mongoose, { Schema, Document } from "mongoose";

export interface ICustomization {
    color?: string;
    colorName?: string;
    designPosition?: [number, number, number];
    designScale?: number;
    originalDesign?: string;
}

export interface IOrderItem {
    productName: string;
    quantity: number;
    price: number;
    variant?: string;
    image?: string;
    customization?: ICustomization;
}

export interface IOrder extends Document {
    orderNumber: string;
    customer: {
        name: string;
        email?: string;
        phone: string;
    };
    items: IOrderItem[];
    fulfillment: {
        method: "express" | "doorstep";
        address?: {
            street: string;
            city: string;
            zip: string;
            country?: string;
        };
    };
    payment: {
        stripeSessionId: string;
        paymentIntentId?: string;
        amount: number;
        currency: string;
        status: "pending" | "paid" | "failed";
    };
    status: "pending" | "processing" | "completed" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        orderNumber: { type: String, required: true, unique: true },
        customer: {
            name: { type: String, required: true },
            email: { type: String },
            phone: { type: String, required: true },
        },
        items: [
            {
                productName: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                variant: { type: String },
                image: { type: String },
                customization: {
                    color: String,
                    colorName: String,
                    designPosition: [Number],
                    designScale: Number,
                    originalDesign: String,
                },
            },
        ],
        fulfillment: {
            method: { type: String, enum: ["express", "doorstep"], required: true },
            address: {
                street: String,
                city: String,
                zip: String,
                country: String,
            },
        },
        payment: {
            stripeSessionId: { type: String, required: true, unique: true },
            paymentIntentId: { type: String },
            amount: { type: Number, required: true },
            currency: { type: String, default: "usd" },
            status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
        },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
