import { Request, Response } from "express";
import { CartModel, Rotation, PaymentStatus, ALLOWED_COLORS } from "../models/cart";
import { ProductModel } from "../models/product";
import User from "../models/User/user";

/* =========================
   CREATE CART
========================= */
export const createCart = async (req: Request, res: Response) => {
  try {
    const {
      userId,          // user id from frontend / auth
      productId,       // existing product id
      totalQuantity,
      tax,
      rotation,
      scale,
      color,
      imageUrl,
      paymentStatus,   // optional
    } = req.body;

    // validation
    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    // check user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // check product exists
    const product = await ProductModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // validate rotation
    if (!Object.values(Rotation).includes(rotation)) {
      return res.status(400).json({ message: "Invalid rotation value" });
    }

    // validate color
    if (!ALLOWED_COLORS.includes(color)) {
      return res.status(400).json({ message: "Invalid color" });
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

    return res.status(201).json({ message: "Cart created successfully", cart });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
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

    return res.status(200).json({ carts });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
