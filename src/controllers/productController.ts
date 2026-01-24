import { Request, Response } from "express";
import { ProductModel } from "../models/product";
import { SuccessHandler } from "../utils/SuccessHandler";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";

/* ============================
   CREATE PRODUCT
============================ */

export const createProduct = async (req: Request, res: Response) => {
  try {
    
    // const { code, productCategory, price, quantity } = req.body;
    const { code, productCategory, price, quantity } = req.body;


    // required validation
    if (!code || !productCategory) {
      return ErrorHandler.handleError(
        new ApiError(400, "code, product category"),
        req,
        res
      );
    }
    // if (!code || !productCategory || price === undefined) {
    //   return ErrorHandler.handleError(
    //     new ApiError(400, "code, product category and price are required"),
    //     req,
    //     res
    //   );
    // }

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
