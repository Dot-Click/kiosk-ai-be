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
const QrCode_1 = __importDefault(require("../models/QrCode"));
const ApiError_1 = require("../utils/ApiError");
// Use require for qrcode to avoid TypeScript issues
const QRCodeGenerator = require('qrcode');
class QRController {
    constructor() {
        // Generate new QR code
        this.generateQR = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔄 Generating QR code...');
                // Generate code
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                // Create upload URL for frontend port 4001
                const uploadUrl = `${process.env.FRONTEND_URL || 'http://kiosk-ai.vercel.app'}/upload?code=${code}`;
                // Generate QR code image
                const qrImageUrl = yield QRCodeGenerator.toDataURL(uploadUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#2d2d6d',
                        light: '#ffffff'
                    },
                    errorCorrectionLevel: 'H'
                });
                // Create QR code in database
                const qrCode = new QrCode_1.default({
                    code,
                    qrImageUrl,
                    uploadUrl,
                    isActive: true,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
                });
                yield qrCode.save();
                console.log('✅ QR Code generated:', code);
                console.log('📱 Upload URL:', uploadUrl);
                // Return the data
                res.json({
                    success: true,
                    message: 'QR code generated successfully',
                    data: {
                        code: qrCode.code,
                        qrImageUrl: qrCode.qrImageUrl,
                        uploadUrl: qrCode.uploadUrl,
                        expiresAt: qrCode.expiresAt,
                        createdAt: qrCode.createdAt
                    }
                });
            }
            catch (error) {
                console.error('❌ QR generation failed:', error);
                next(new ApiError_1.ApiError(500, 'Failed to generate QR code'));
            }
        });
        // Validate QR code
        this.validateQR = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { code } = req.params;
                if (!code || code.length !== 6) {
                    throw new ApiError_1.ApiError(400, 'Invalid QR code format');
                }
                // Check if QR code exists and is valid
                const qrCode = yield QrCode_1.default.findOne({
                    code,
                    isActive: true,
                    expiresAt: { $gt: new Date() }
                });
                if (!qrCode) {
                    throw new ApiError_1.ApiError(404, 'QR code not found or expired');
                }
                res.json({
                    success: true,
                    message: 'QR code is valid',
                    data: {
                        code,
                        isValid: true,
                        expiresAt: qrCode.expiresAt
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
        // Get QR code details
        this.getQRDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { code } = req.params;
                const qrCode = yield QrCode_1.default.findOne({ code });
                if (!qrCode) {
                    throw new ApiError_1.ApiError(404, 'QR code not found');
                }
                const isValid = qrCode.isActive && qrCode.expiresAt > new Date();
                res.json({
                    success: true,
                    message: 'QR code details retrieved',
                    data: {
                        code: qrCode.code,
                        isActive: qrCode.isActive,
                        expiresAt: qrCode.expiresAt,
                        createdAt: qrCode.createdAt,
                        isValid: isValid,
                        uploadUrl: qrCode.uploadUrl
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
        // Deactivate QR code
        this.deactivateQR = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { code } = req.params;
                const qrCode = yield QrCode_1.default.findOneAndUpdate({ code }, { isActive: false }, { new: true });
                if (!qrCode) {
                    throw new ApiError_1.ApiError(404, 'QR code not found');
                }
                res.json({
                    success: true,
                    message: 'QR code deactivated',
                    data: {
                        code: qrCode.code,
                        isActive: qrCode.isActive,
                        deactivatedAt: new Date()
                    }
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new QRController();
//# sourceMappingURL=qrController.js.map