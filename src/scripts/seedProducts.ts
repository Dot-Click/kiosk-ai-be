import mongoose from "mongoose";
import dotenv from "dotenv";
import { ProductModel } from "../models/product";

// Load env vars
dotenv.config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
}

const seedProducts = async () => {
    try {
        console.log("🚀 Starting Product Migration...");
        await mongoose.connect(mongoUri, { dbName: "kiosk-ai" });
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
            const existing = await ProductModel.findOne({ code: prod.code });
            if (existing) {
                console.log(`⚠️  Product ${prod.code} already exists. Skipping...`);
            } else {
                await ProductModel.create(prod);
                console.log(`✨ Created Product: ${prod.productCategory} (${prod.code})`);
            }
        }

        console.log("✅ Product Migration Completed Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
};

seedProducts();
