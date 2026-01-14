"use strict";
// // // src/controllers/qrController.ts
// // import { Request, Response, NextFunction } from 'express';
// // import QRCode from '../models/QrCode';
// // import { ApiError } from '../utils/ApiError';
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
exports.getQRDetails = exports.validateQR = exports.generateQR = void 0;
const db_1 = require("../config/db");
// In-memory storage fallback
const qrCodes = new Map();
const generateQR = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data = 'kiosk-upload' } = req.body;
        const code = Date.now().toString();
        const uploadUrl = `https://kiosk-ai.vercel.app/upload?code=${code}`;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;
        console.log(`✅ QR generated for code: ${code}`);
        const qrData = {
            code,
            uploadUrl,
            qrImageUrl,
            isActive: true,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        };
        // Save to database if available
        const db = (0, db_1.getDB)();
        if (db) {
            yield db.collection('qrcodes').insertOne(qrData);
        }
        else {
            qrCodes.set(code, qrData);
        }
        res.status(200).json({
            success: true,
            data: {
                id: code,
                code: code,
                url: qrImageUrl,
                uploadUrl: uploadUrl
            }
        });
    }
    catch (error) {
        console.error('QR generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.generateQR = generateQR;
const validateQR = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        console.log(`🔍 Validating QR code: ${code}`);
        // Check if QR is valid (not expired and active)
        const now = new Date();
        let isValid = false;
        const db = (0, db_1.getDB)();
        if (db) {
            const qrCode = yield db.collection('qrcodes').findOne({
                code,
                isActive: true,
                expiresAt: { $gt: now }
            });
            isValid = !!qrCode;
        }
        else {
            const qrCode = qrCodes.get(code);
            isValid = (qrCode === null || qrCode === void 0 ? void 0 : qrCode.isActive) && qrCode.expiresAt > now;
        }
        res.status(200).json({
            success: true,
            data: {
                isValid: isValid,
                code: code,
                message: isValid ? 'QR code is valid' : 'QR code expired or invalid'
            }
        });
    }
    catch (error) {
        console.error('QR validation error:', error);
        res.status(200).json({
            success: true,
            data: {
                isValid: false,
                code: req.params.code,
                message: 'QR code check failed'
            }
        });
    }
});
exports.validateQR = validateQR;
const getQRDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        let qrData = null;
        const db = (0, db_1.getDB)();
        if (db) {
            qrData = yield db.collection('qrcodes').findOne({ code });
        }
        else {
            qrData = qrCodes.get(code) || null;
        }
        if (!qrData) {
            return res.status(404).json({
                success: false,
                error: 'QR code not found'
            });
        }
        res.status(200).json({
            success: true,
            data: qrData
        });
    }
    catch (error) {
        console.error('Get QR details error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.getQRDetails = getQRDetails;
//# sourceMappingURL=qrController.js.map