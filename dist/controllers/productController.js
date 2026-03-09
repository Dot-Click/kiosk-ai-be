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
exports.deleteProduct = exports.updateProduct = exports.migrateProducts = exports.getAllProducts = exports.createProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_1 = require("../models/product");
const SuccessHandler_1 = require("../utils/SuccessHandler");
const ErrorHandler_1 = require("../utils/ErrorHandler");
/* ============================
   CREATE PRODUCT
============================ */
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            const mongoUri = process.env.MONGODB_URI;
            if (mongoUri)
                yield mongoose_1.default.connect(mongoUri, { dbName: "kiosk-ai" });
        }
        const { code, productCategory, price, quantity } = req.body;
        // required validation
        if (!code || !productCategory) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(400, "code, product category"), req, res);
        }
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
        if (mongoose_1.default.connection.readyState !== 1) {
            const mongoUri = process.env.MONGODB_URI;
            if (mongoUri)
                yield mongoose_1.default.connect(mongoUri, { dbName: "kiosk-ai" });
        }
        const tshirtExists = yield product_1.ProductModel.findOne({ code: "price-tshirt" });
        const mugExists = yield product_1.ProductModel.findOne({ code: "price-mug" });
        if (!tshirtExists) {
            console.log("[Seeder] price-tshirt not found. Adding...");
            yield product_1.ProductModel.create({
                code: "price-tshirt",
                productCategory: "T-shirt",
                price: 500,
                quantity: 100,
            });
        }
        if (!mugExists) {
            console.log("[Seeder] price-mug not found. Adding...");
            yield product_1.ProductModel.create({
                code: "price-mug",
                productCategory: "Mug",
                price: 300,
                quantity: 100,
            });
        }
        const products = yield product_1.ProductModel.find().sort({ createdAt: -1 });
        return SuccessHandler_1.SuccessHandler.handle(res, "Products fetched successfully", products, 200);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), _req, res);
    }
});
exports.getAllProducts = getAllProducts;
/* ============================
   MIGRATE/RESET STORE PRODUCTS
============================ */
const migrateProducts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            const mongoUri = process.env.MONGODB_URI;
            if (mongoUri)
                yield mongoose_1.default.connect(mongoUri, { dbName: "kiosk-ai" });
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
            const existing = yield product_1.ProductModel.findOne({ code: prod.code });
            if (!existing) {
                const created = yield product_1.ProductModel.create(prod);
                results.push(`Created: ${prod.productCategory}`);
            }
            else {
                results.push(`Exists: ${prod.productCategory}`);
            }
        }
        return SuccessHandler_1.SuccessHandler.handle(res, "Migration completed successfully", { summary: results }, 200);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), _req, res);
    }
});
exports.migrateProducts = migrateProducts;
/* ============================
   UPDATE PRODUCT
============================ */
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            const mongoUri = process.env.MONGODB_URI;
            if (mongoUri)
                yield mongoose_1.default.connect(mongoUri, { dbName: "kiosk-ai" });
        }
        const { id } = req.params;
        const { code, productCategory, price, quantity } = req.body;
        const product = yield product_1.ProductModel.findById(id);
        if (!product) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(404, "Product not found"), req, res);
        }
        if (code)
            product.code = code.trim();
        if (productCategory)
            product.productCategory = productCategory;
        if (price !== undefined)
            product.price = price;
        if (quantity !== undefined)
            product.quantity = quantity;
        yield product.save();
        return SuccessHandler_1.SuccessHandler.handle(res, "Product updated successfully", product, 200);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), req, res);
    }
});
exports.updateProduct = updateProduct;
/* ============================
   DELETE PRODUCT
============================ */
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            const mongoUri = process.env.MONGODB_URI;
            if (mongoUri)
                yield mongoose_1.default.connect(mongoUri, { dbName: "kiosk-ai" });
        }
        const { id } = req.params;
        const product = yield product_1.ProductModel.findByIdAndDelete(id);
        if (!product) {
            return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(404, "Product not found"), req, res);
        }
        return SuccessHandler_1.SuccessHandler.handle(res, "Product deleted successfully", null, 200);
    }
    catch (error) {
        return ErrorHandler_1.ErrorHandler.handleError(new ErrorHandler_1.ApiError(500, error.message), req, res);
    }
});
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map