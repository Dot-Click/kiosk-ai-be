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
const UploadedImage_1 = require("../models/UploadedImage");
const QrCode_1 = __importDefault(require("../models/QrCode"));
const logger_1 = require("../functions/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function cleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info('Starting cleanup job...');
            // Connect to MongoDB
            yield mongoose_1.default.connect(process.env.MONGODB_URI);
            logger_1.logger.info('Connected to MongoDB');
            // Cleanup expired uploads
            const cleanedCount = yield UploadedImage_1.UploadedImage.cleanupExpired();
            logger_1.logger.info(`Cleaned up ${cleanedCount} expired images`);
            // Find and deactivate expired QR codes
            const expiredQRCodes = yield QrCode_1.default.updateMany({
                expiresAt: { $lt: new Date() },
                isActive: true
            }, { isActive: false });
            logger_1.logger.info(`Deactivated ${expiredQRCodes.modifiedCount} expired QR codes`);
            // Close connection
            yield mongoose_1.default.connection.close();
            logger_1.logger.info('Cleanup completed successfully');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error(`Cleanup failed: ${error.message}`);
            process.exit(1);
        }
    });
}
cleanup();
//# sourceMappingURL=cleanup.js.map