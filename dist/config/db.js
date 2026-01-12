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
const logger_1 = require("../functions/logger");
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://muhammedlayan12_db_user:x3dvp6hVDBINZMJ4@cluster0.bv01kjv.mongodb.net/?appName=Cluster0';
        yield mongoose_1.default.connect(mongoURI);
        logger_1.logger.info('✅ MongoDB Connected Successfully');
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error(`MongoDB connection error: ${err}`);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB disconnected');
        });
    }
    catch (error) {
        logger_1.logger.error(`❌ MongoDB Connection Error: ${error}`);
        process.exit(1);
    }
});
exports.default = connectDB;
//# sourceMappingURL=db.js.map