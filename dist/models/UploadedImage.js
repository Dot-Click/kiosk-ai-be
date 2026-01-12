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
// src/models/UploadedImage.ts
const mongoose_1 = __importStar(require("mongoose"));
const UploadedImageSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: [true, 'Code is required'],
        unique: true,
        trim: true,
        minlength: [6, 'Code must be 6 digits'],
        maxlength: [6, 'Code must be 6 digits'],
        match: [/^\d{6}$/, 'Code must be 6 digits'],
        index: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    imagePath: {
        type: String,
        required: [true, 'Image path is required']
    },
    fileName: {
        type: String,
        required: [true, 'File name is required']
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required'],
        min: [1, 'File size must be at least 1 byte']
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type is required'],
        enum: {
            values: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
            message: '{VALUE} is not a supported image type'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'uploaded', 'processed', 'expired'],
        default: 'pending',
        index: true
    },
    uploadedBy: {
        type: String,
        default: 'anonymous'
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        index: true
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});
// Indexes
UploadedImageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
UploadedImageSchema.index({ code: 1, status: 1 });
// Static method to find by code
UploadedImageSchema.static('findByCode', function (code) {
    return this.findOne({ code, status: 'uploaded' });
});
// Static method to get upload status
UploadedImageSchema.static('getUploadStatus', function (code) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = yield this.findOne({ code, status: 'uploaded' });
        return {
            exists: !!image,
            image: image || undefined
        };
    });
});
// Static method to cleanup expired
UploadedImageSchema.static('cleanupExpired', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const fs = require('fs').promises;
        const expiredImages = yield this.find({
            expiresAt: { $lt: new Date() },
            status: { $ne: 'expired' }
        });
        let cleanedCount = 0;
        for (const image of expiredImages) {
            try {
                // Delete file
                yield fs.unlink(image.imagePath);
                // Update status
                image.status = 'expired';
                yield image.save();
                cleanedCount++;
            }
            catch (error) {
                console.error(`Failed to cleanup image ${image.code}:`, error);
            }
        }
        return cleanedCount;
    });
});
// Create and export the model
const UploadedImage = mongoose_1.default.model('UploadedImage', UploadedImageSchema);
exports.default = UploadedImage;
//# sourceMappingURL=UploadedImage.js.map