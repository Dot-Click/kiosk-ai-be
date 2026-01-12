"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const QRCodeSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: [true, 'Code is required'],
        unique: true,
        trim: true,
        minlength: [6, 'Code must be 6 digits'],
        maxlength: [6, 'Code must be 6 digits'],
        match: [/^\d{6}$/, 'Code must be 6 digits']
    },
    qrImageUrl: {
        type: String,
        required: [true, 'QR image URL is required']
    },
    uploadUrl: {
        type: String,
        required: [true, 'Upload URL is required']
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        index: true
    }
}, {
    timestamps: true
});
// Indexes
QRCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
QRCodeSchema.index({ code: 1, isActive: 1 });
QRCodeSchema.index({ createdAt: -1 });
// Static method to generate new QR code
QRCodeSchema.statics.generateQR = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const QRCodeGenerator = require('qrcode');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // CRITICAL FIX: Use FRONTEND_URL from .env
        const frontendUrl = process.env.FRONTEND_URL || 'http://kiosk-ai.vercel.app';
        const uploadUrl = `${frontendUrl}/upload?code=${code}`;
        console.log('🔗 Generating QR with:', {
            code,
            frontendUrl,
            uploadUrl
        });
        const qrImageUrl = yield QRCodeGenerator.toDataURL(uploadUrl, {
            width: parseInt(process.env.QR_CODE_SIZE || '300'),
            margin: parseInt(process.env.QR_CODE_MARGIN || '2'),
            color: {
                dark: process.env.QR_CODE_DARK_COLOR || '#2d2d6d',
                light: process.env.QR_CODE_LIGHT_COLOR || '#ffffff'
            },
            errorCorrectionLevel: 'H'
        });
        const qrCode = yield this.create({
            code,
            qrImageUrl,
            uploadUrl,
            isActive: true,
            expiresAt: new Date(Date.now() + (parseInt(process.env.QR_CODE_EXPIRE_MINUTES || '60') * 60 * 1000))
        });
        console.log('✅ QR Code generated:', code);
        return qrCode;
    });
};
QRCodeSchema.statics.validateQR = function (code) {
    return __awaiter(this, void 0, void 0, function* () {
        const qrCode = yield this.findOne({
            code,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });
        return !!qrCode;
    });
};
QRCodeSchema.statics.deactivateQR = function (code) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.findOneAndUpdate({ code }, { isActive: false }, { new: true });
    });
};
exports.default = mongoose_1.default.model('QRCode', QRCodeSchema);
//# sourceMappingURL=QrCode.js.map