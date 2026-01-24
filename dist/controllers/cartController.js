"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCarts = exports.createCart = void 0;
const cart_1 = require("../models/cart");
const product_1 = require("../models/product");
const user_1 = __importDefault(require("../models/User/user"));
/* =========================
   CREATE CART
========================= */
const createCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, // user id from frontend / auth
        productId, // existing product id
        totalQuantity, tax, rotation, scale, color, imageUrl, paymentStatus, // optional
         } = req.body;
        // validation
        if (!userId || !productId) {
            return res.status(400).json({ message: "userId and productId are required" });
        }
        // check user exists
        const user = yield user_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // check product exists
        const product = yield product_1.ProductModel.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        // validate rotation
        if (!Object.values(cart_1.Rotation).includes(rotation)) {
            return res.status(400).json({ message: "Invalid rotation value" });
        }
        // validate color
        if (!cart_1.ALLOWED_COLORS.includes(color)) {
            return res.status(400).json({ message: "Invalid color" });
        }
        // calculate totalPrice
        const totalPrice = product.price * totalQuantity + tax;
        // create cart
        const cart = yield cart_1.CartModel.create({
            user: user._id,
            product: product._id,
            totalPrice,
            totalQuantity,
            tax,
            rotation,
            scale,
            color,
            imageUrl,
            paymentStatus: paymentStatus || cart_1.PaymentStatus.PENDING,
        });
        return res.status(201).json({ message: "Cart created successfully", cart });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
});
exports.createCart = createCart;
/* =========================
   GET ALL CARTS
========================= */
const getAllCarts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const carts = yield cart_1.CartModel.find()
            .populate("user", "first_name last_name email")
            .populate("product", "code productCategory price");
        return res.status(200).json({ carts });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
});
exports.getAllCarts = getAllCarts;
//# sourceMappingURL=cartController.js.map