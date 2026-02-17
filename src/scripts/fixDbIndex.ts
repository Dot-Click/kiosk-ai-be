import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/Order";

dotenv.config();

const fixDb = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI not set");

        console.log("Connecting to DB...");
        await mongoose.connect(uri);
        console.log("Connected.");

        const collection = mongoose.connection.collection("orders");
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes);

        const targetIndex = indexes.find((i: any) => i.name === "stripePaymentIntentId_1");
        if (targetIndex) {
            console.log("Found bad index. Dropping 'stripePaymentIntentId_1'...");
            await collection.dropIndex("stripePaymentIntentId_1");
            console.log("Index dropped successfully.");
        } else {
            console.log("Index 'stripePaymentIntentId_1' not found. It might have effectively been removed already.");
        }

        console.log("Done.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixDb();
