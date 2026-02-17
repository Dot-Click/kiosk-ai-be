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
dotenv_1.default.config();
const fixDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri)
            throw new Error("MONGODB_URI not set");
        console.log("Connecting to DB...");
        yield mongoose_1.default.connect(uri);
        console.log("Connected.");
        const collection = mongoose_1.default.connection.collection("orders");
        const indexes = yield collection.indexes();
        console.log("Current indexes:", indexes);
        const targetIndex = indexes.find((i) => i.name === "stripePaymentIntentId_1");
        if (targetIndex) {
            console.log("Found bad index. Dropping 'stripePaymentIntentId_1'...");
            yield collection.dropIndex("stripePaymentIntentId_1");
            console.log("Index dropped successfully.");
        }
        else {
            console.log("Index 'stripePaymentIntentId_1' not found. It might have effectively been removed already.");
        }
        console.log("Done.");
        process.exit(0);
    }
    catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
});
fixDb();
//# sourceMappingURL=fixDbIndex.js.map