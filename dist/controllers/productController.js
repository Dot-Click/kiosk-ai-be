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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = exports.createProduct = void 0;
const product_1 = require("../models/product");
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
/* ============================
   CREATE PRODUCT
============================ */
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { code, productCategory, price, quantity } = req.body;
        const { code, productCategory, price, quantity } = req.body;
        // required validation
        if (!code || !productCategory) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "code, product category"), req, res);
        }
        // if (!code || !productCategory || price === undefined) {
        //   return ErrorHandler.handleError(
        //     new ApiError(400, "code, product category and price are required"),
        //     req,
        //     res
        //   );
        // }
        // check duplicate code
        const existingProduct = yield product_1.ProductModel.findOne({ code });
        if (existingProduct) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "Product with this code already exists"), req, res);
        }
        const product = yield product_1.ProductModel.create({
            code: code.trim(),
            productCategory,
            price,
            quantity, // optional
        });
        return SuccessHandler_1.SuccessHandler.handle(res, "Product created successfully", product, 201);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), req, res);
    }
});
exports.createProduct = createProduct;
/* ============================
   GET ALL PRODUCTS
============================ */
const getAllProducts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_1.ProductModel.find().sort({ createdAt: -1 });
        return SuccessHandler_1.SuccessHandler.handle(res, "Products fetched successfully", products, 200);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), _req, res);
    }
});
exports.getAllProducts = getAllProducts;
//# sourceMappingURL=productController.js.map