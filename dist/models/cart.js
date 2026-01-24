"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartModel = exports.ALLOWED_COLORS = exports.PaymentStatus = exports.Rotation = void 0;
const mongoose_1 = require("mongoose");
/* ENUMS */
var Rotation;
(function (Rotation) {
    Rotation["RIGHT"] = "RIGHT";
    Rotation["LEFT"] = "LEFT";
})(Rotation || (exports.Rotation = Rotation = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
exports.ALLOWED_COLORS = [
    "#FF3A02",
    "#F7C223",
    "#8F00FF",
    "#A855F7",
    "#FBBF24",
    "#CD7F32",
    "#00B5AD",
    "#954535",
];
/* SCHEMA */
const CartSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    totalPrice: { type: Number, required: true, min: 0 },
    totalQuantity: { type: Number, required: true, min: 1 },
    tax: { type: Number, required: true, min: 0 },
    rotation: { type: String, enum: Object.values(Rotation), required: true },
    scale: { type: String, required: true, trim: true },
    color: { type: String, enum: exports.ALLOWED_COLORS, required: true },
    imageUrl: { type: String, required: true, trim: true },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), required: true, default: PaymentStatus.PENDING },
}, { timestamps: true });
/* MODEL */
exports.CartModel = (0, mongoose_1.model)("Cart", CartSchema);
//# sourceMappingURL=cart.js.map