import { Request, Response } from "express";
import mongoose from "mongoose";
import { ProductModel } from "../models/product";
import { SuccessHandler } from "../utils/SuccessHandler";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";

/* ============================
   CREATE PRODUCT
============================ */

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI;
      if (mongoUri) await mongoose.connect(mongoUri, { dbName: "kiosk-ai" });
    }

    const { code, productCategory, price, quantity } = req.body;

    // required validation
    if (!code || !productCategory) {
      return ErrorHandler.handleError(
        new ApiError(400, "code, product category"),
        req,
        res
      );
    }

    // check duplicate code
    const existingProduct = await ProductModel.findOne({ code });
    if (existingProduct) {
      return ErrorHandler.handleError(
        new ApiError(400, "Product with this code already exists"),
        req,
        res
      );
    }

    const product = await ProductModel.create({
      code: code.trim(),
      productCategory,
      price,
      quantity, // optional
    });

    return SuccessHandler.handle(
      res,
      "Product created successfully",
      product,
      201
    );
  } catch (error: any) {
    return ErrorHandler.handleError(
      new ApiError(500, error.message),
      req,
      res
    );
  }
};

/* ============================
   GET ALL PRODUCTS
============================ */

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI;
      if (mongoUri) await mongoose.connect(mongoUri, { dbName: "kiosk-ai" });
    }

    const tshirtExists = await ProductModel.findOne({ code: "price-tshirt" });
    const mugExists = await ProductModel.findOne({ code: "price-mug" });

    if (!tshirtExists) {
      console.log("[Seeder] price-tshirt not found. Adding...");
      await ProductModel.create({
        code: "price-tshirt",
        productCategory: "T-shirt",
        price: 500,
        quantity: 100,
      });
    }

    if (!mugExists) {
      console.log("[Seeder] price-mug not found. Adding...");
      await ProductModel.create({
        code: "price-mug",
        productCategory: "Mug",
        price: 300,
        quantity: 100,
      });
    }

    const products = await ProductModel.find().sort({ createdAt: -1 });

    return SuccessHandler.handle(
      res,
      "Products fetched successfully",
      products,
      200
    );
  } catch (error: any) {
    return ErrorHandler.handleError(
      new ApiError(500, error.message),
      _req,
      res
    );
  }
};

/* ============================
   MIGRATE/RESET STORE PRODUCTS
============================ */

export const migrateProducts = async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI;
      if (mongoUri) await mongoose.connect(mongoUri, { dbName: "kiosk-ai" });
    }

    const migrationList = [
      {
        code: "price-tshirt",
        productCategory: "T-shirt",
        price: 500,
        quantity: 100
      },
      {
        code: "price-mug",
        productCategory: "Mug",
        price: 300,
        quantity: 100
      }
    ];

    const results = [];
    for (const prod of migrationList) {
      const existing = await ProductModel.findOne({ code: prod.code });
      if (!existing) {
        const created = await ProductModel.create(prod);
        results.push(`Created: ${prod.productCategory}`);
      } else {
        results.push(`Exists: ${prod.productCategory}`);
      }
    }

    return SuccessHandler.handle(
      res,
      "Migration completed successfully",
      { summary: results },
      200
    );
  } catch (error: any) {
    return ErrorHandler.handleError(
      new ApiError(500, error.message),
      _req,
      res
    );
  }
};

/* ============================
   UPDATE PRODUCT
============================ */

export const updateProduct = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI;
      if (mongoUri) await mongoose.connect(mongoUri, { dbName: "kiosk-ai" });
    }

    const { id } = req.params;
    const { code, productCategory, price, quantity } = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      return ErrorHandler.handleError(
        new ApiError(404, "Product not found"),
        req,
        res
      );
    }

    if (code) product.code = code.trim();
    if (productCategory) product.productCategory = productCategory;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;

    await product.save();

    return SuccessHandler.handle(
      res,
      "Product updated successfully",
      product,
      200
    );
  } catch (error: any) {
    return ErrorHandler.handleError(
      new ApiError(500, error.message),
      req,
      res
    );
  }
};

/* ============================
   DELETE PRODUCT
============================ */

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI;
      if (mongoUri) await mongoose.connect(mongoUri, { dbName: "kiosk-ai" });
    }

    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return ErrorHandler.handleError(
        new ApiError(404, "Product not found"),
        req,
        res
      );
    }

    return SuccessHandler.handle(
      res,
      "Product deleted successfully",
      null,
      200
    );
  } catch (error: any) {
    return ErrorHandler.handleError(
      new ApiError(500, error.message),
      req,
      res
    );
  }
};
