"use strict";
// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv';
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
exports.deleteFromCloudinary = exports.isCloudinaryAvailable = exports.uploadToCloudinary = void 0;
// dotenv.config();
// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// export const uploadToCloudinary = async (filePath: string): Promise<string> => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: 'kiosk-ai-uploads',
//       resource_type: 'auto',
//     });
//     return result.secure_url;
//   } catch (error) {
//     console.error('Cloudinary upload error:', error);
//     throw error;
//   }
// };
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Debug: Log Cloudinary config (mask secrets)
console.log('🔍 Checking Cloudinary configuration...');
console.log('📝 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Not set');
console.log('📝 API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set (masked)' : '✗ Not set');
console.log('📝 API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set (masked)' : '✗ Not set');
console.log('📝 Folder:', process.env.CLOUDINARY_FOLDER || 'kiosk-ai-uploads');
// Validate Cloudinary configuration
function validateCloudinaryConfig() {
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.log(`⚠️  Cloudinary not fully configured. Missing: ${missing.join(', ')}`);
        console.log('⚠️  Image uploads will use local storage only');
        return false;
    }
    return true;
}
const isCloudinaryConfigured = validateCloudinaryConfig();
if (isCloudinaryConfigured) {
    try {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
        console.log('✅ Cloudinary configured successfully');
    }
    catch (error) {
        console.error('❌ Cloudinary configuration failed:', error);
    }
}
const uploadToCloudinary = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if file exists
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    // Check file size (Cloudinary limit: 10MB for free tier)
    const stats = fs_1.default.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    if (fileSizeInMB > 10) {
        throw new Error(`File too large: ${fileSizeInMB.toFixed(2)}MB. Max 10MB for Cloudinary.`);
    }
    if (!isCloudinaryConfigured) {
        throw new Error('Cloudinary not configured. Check environment variables.');
    }
    try {
        console.log(`☁️ Uploading to Cloudinary: ${path_1.default.basename(filePath)} (${fileSizeInMB.toFixed(2)}MB)`);
        const folder = process.env.CLOUDINARY_FOLDER || 'kiosk-ai-uploads';
        const result = yield cloudinary_1.v2.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            timeout: 60000, // 60 seconds timeout
        });
        console.log(`✅ Cloudinary upload successful:`);
        console.log(`   📁 URL: ${result.secure_url}`);
        console.log(`   📊 Format: ${result.format}`);
        console.log(`   📏 Size: ${result.bytes} bytes`);
        console.log(`   🆔 Public ID: ${result.public_id}`);
        return result.secure_url;
    }
    catch (error) {
        console.error('❌ Cloudinary upload failed:', error.message);
        // Specific error handling
        if (error.http_code === 401) {
            console.error('❌ Cloudinary authentication failed. Check API key/secret.');
        }
        else if (error.http_code === 404) {
            console.error('❌ Cloudinary cloud not found. Check cloud name.');
        }
        else if (error.http_code === 413) {
            console.error('❌ File too large for Cloudinary.');
        }
        else if (error.message.includes('ENOTFOUND')) {
            console.error('❌ Network error. Check internet connection.');
        }
        throw error;
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
const isCloudinaryAvailable = () => {
    return isCloudinaryConfigured;
};
exports.isCloudinaryAvailable = isCloudinaryAvailable;
const deleteFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isCloudinaryConfigured)
        return;
    try {
        yield cloudinary_1.v2.uploader.destroy(publicId);
        console.log(`🗑️  Deleted from Cloudinary: ${publicId}`);
    }
    catch (error) {
        console.error('❌ Failed to delete from Cloudinary:', error);
    }
});
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinary.js.map