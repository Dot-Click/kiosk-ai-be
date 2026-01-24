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
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
/* =========================
   CREATE CART
========================= */
const createCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, productId, totalQuantity, tax, rotation, scale, color, imageUrl, paymentStatus, } = req.body;
        // validation
        if (!userId || !productId) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "userId and productId are required"), req, res);
        }
        // check user exists
        const user = yield user_1.default.findById(userId);
        if (!user) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(404, "User not found"), req, res);
        }
        // check product exists
        const product = yield product_1.ProductModel.findById(productId);
        if (!product) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(404, "Product not found"), req, res);
        }
        // validate rotation
        if (!Object.values(cart_1.Rotation).includes(rotation)) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Invalid rotation value"), req, res);
        }
        // validate color
        if (!cart_1.ALLOWED_COLORS.includes(color)) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Invalid color"), req, res);
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
        return SuccessHandler_1.SuccessHandler.handle(res, "Cart created successfully", cart, 201);
    }
    catch (error) {
        console.error(error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), req, res);
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
        return SuccessHandler_1.SuccessHandler.handle(res, "Carts fetched successfully", carts, 200);
    }
    catch (error) {
        console.error(error);
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), _req, res);
    }
});
exports.getAllCarts = getAllCarts;
//# sourceMappingURL=cartController.js.map