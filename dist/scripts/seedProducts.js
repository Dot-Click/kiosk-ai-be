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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const product_1 = require("../models/product");
// Load env vars
dotenv_1.default.config();
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
}
const seedProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🚀 Starting Product Migration...");
        yield mongoose_1.default.connect(mongoUri, { dbName: "kiosk-ai" });
        console.log("✅ Connected to MongoDB");
        const productsToSeed = [
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
        for (const prod of productsToSeed) {
            const existing = yield product_1.ProductModel.findOne({ code: prod.code });
            if (existing) {
                console.log(`⚠️  Product ${prod.code} already exists. Skipping...`);
            }
            else {
                yield product_1.ProductModel.create(prod);
                console.log(`✨ Created Product: ${prod.productCategory} (${prod.code})`);
            }
        }
        console.log("✅ Product Migration Completed Successfully!");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
});
seedProducts();
//# sourceMappingURL=seedProducts.js.map