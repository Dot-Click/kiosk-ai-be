"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = exports.ProductCategory = void 0;
const mongoose_1 = require("mongoose");
//  ENUMS 
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["CUP"] = "CUP";
    ProductCategory["TSHIRT"] = "TSHIRT";
    ProductCategory["LAMP"] = "LAMP";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
/*  SCHEMA */
const ProductSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    versionKey: false,
});
/* ============================
   MODEL
============================ */
exports.ProductModel = (0, mongoose_1.model)("Product", ProductSchema);
//# sourceMappingURL=product.js.map