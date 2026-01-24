import { Request, Response } from "express";
import { CartModel, Rotation, PaymentStatus, ALLOWED_COLORS } from "../models/cart";
import { ProductModel } from "../models/product";
import User from "../models/User/user";
import { SuccessHandler } from "../utils/SuccessHandler";
import { ErrorHandler, ApiError } from "../utils/ErrorHandler";


/* =========================
   CREATE CART
========================= */
export const createCart = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      productId,
      totalQuantity,
      tax,
      rotation,
      scale,
      color,
      imageUrl,
      paymentStatus,
    } = req.body;

    // validation
    if (!userId || !productId) {
      return ErrorHandler.handleError(
        new ApiError(400, "userId and productId are required"),
        req,
        res
      );
    }

    // check user exists
    const user = await User.findById(userId);
    if (!user) {
      return ErrorHandler.handleError(
        new ApiError(404, "User not found"),
        req,
        res
      );
    }

    // check product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return ErrorHandler.handleError(
        new ApiError(404, "Product not found"),
        req,
        res
      );
    }

    // validate rotation
    if (!Object.values(Rotation).includes(rotation)) {
      return ErrorHandler.handleError(
        new ApiError(400, "Invalid rotation value"),
        req,
        res
      );
    }

    // validate color
    if (!ALLOWED_COLORS.includes(color)) {
      return ErrorHandler.handleError(
        new ApiError(400, "Invalid color"),
        req,
        res
      );
    }

    // calculate totalPrice
    const totalPrice = product.price * totalQuantity + tax;

    // create cart
    const cart = await CartModel.create({
      user: user._id,
      product: product._id,
      totalPrice,
      totalQuantity,
      tax,
      rotation,
      scale,
      color,
      imageUrl,
      paymentStatus: paymentStatus || PaymentStatus.PENDING,
    });

    return SuccessHandler.handle(
      res,
      "Cart created successfully",
      cart,
      201
    );

  } catch (error: any) {
    console.error(error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message),
      req,
      res
    );
  }
};

/* =========================
   GET ALL CARTS
========================= */
export const getAllCarts = async (_req: Request, res: Response) => {
  try {
    const carts = await CartModel.find()
      .populate("user", "first_name last_name email")
      .populate("product", "code productCategory price");

    return SuccessHandler.handle(
      res,
      "Carts fetched successfully",
      carts,
      200
    );
  } catch (error: any) {
    console.error(error);
    return ErrorHandler.handleError(
      new ApiError(500, error.message),
      _req,
      res
    );
  }
};
