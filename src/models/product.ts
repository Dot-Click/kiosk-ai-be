import { Schema, model, Document } from "mongoose";

  //  ENUMS 

export enum ProductCategory {
  CUP = "CUP",
  TSHIRT = "TSHIRT",
  LAMP = "LAMP",
}

/* INTERFACE */

export interface IProduct extends Document {
  code: string;                 // product code
  productCategory: ProductCategory;
  price: number;
  quantity: number;            // optional
}

/*  SCHEMA */

const ProductSchema = new Schema<IProduct>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    productCategory: {
      type: String,
      enum: Object.values(ProductCategory),
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ============================
   MODEL
============================ */

export const ProductModel =
  model<IProduct>("Product", ProductSchema);
