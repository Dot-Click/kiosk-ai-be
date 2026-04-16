"use strict";
// // // src/controllers/uploadController.ts
// // import { Request, Response, NextFunction } from 'express';
// // import UploadedImage from '../models/UploadedImage';
// // import QRCode from '../models/QrCode';
// // import fs from 'fs/promises';
// // import fsSync from 'fs'; 
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldFiles = exports.getImage = exports.checkUpload = exports.uploadImage = exports.uploads = void 0;
const db_1 = require("../config/db");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("../utils/cloudinary");
// In-memory storage fallback
exports.uploads = new Map();
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Code is required'
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }
        console.log(`✅ Image uploaded for code: ${code}`);
        let imageUrl;
        let cloudinaryUrl;
        // Upload to Cloudinary if configured
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            try {
                cloudinaryUrl = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path);
                imageUrl = cloudinaryUrl;
                console.log(`☁️ Image uploaded to Cloudinary: ${cloudinaryUrl}`);
            }
            catch (cloudinaryError) {
                console.error('Cloudinary upload failed, using local:', cloudinaryError);
                imageUrl = `https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/${code}`;
            }
        }
        else {
            imageUrl = `https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/${code}`;
        }
        const uploadData = {
            code,
            imageUrl,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            status: 'uploaded',
            uploadedBy: req.ip || 'unknown'
        };
        if (cloudinaryUrl) {
            uploadData.cloudinaryUrl = cloudinaryUrl;
        }
        // Save to database if available
        const db = (0, db_1.getDB)();
        if (db) {
            const result = yield db.collection('uploads').insertOne(uploadData);
            uploadData._id = result.insertedId;
            console.log(`💾 Saved to database for code: ${code}`);
        }
        else {
            exports.uploads.set(code, uploadData);
            console.log(`⚠️  No database, storing in memory for code: ${code}`);
        }
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                code: code,
                imageUrl: imageUrl,
                cloudinaryUrl: cloudinaryUrl,
                fileName: uploadData.originalName,
                fileSize: uploadData.fileSize,
                uploadedAt: uploadData.uploadedAt.toISOString()
            }
        });
    }
    catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Upload failed: ' + error.message
        });
    }
});
exports.uploadImage = uploadImage;
const checkUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        console.log(`🔍 Checking upload for code: ${code}`);
        let uploadData = null;
        const db = (0, db_1.getDB)();
        if (db) {
            const result = yield db.collection('uploads').findOne({ code });
            // Type assertion or conversion
            uploadData = result;
        }
        else {
            uploadData = exports.uploads.get(code) || null;
        }
        if (uploadData) {
            // Check if file still exists locally (if not using Cloudinary)
            if (!uploadData.cloudinaryUrl && !fs_1.default.existsSync(uploadData.filePath)) {
                return res.status(200).json({
                    success: true,
                    data: {
                        exists: false,
                        code: code,
                        message: 'Image file not found'
                    }
                });
            }
            res.status(200).json({
                success: true,
                data: {
                    exists: true,
                    code: code,
                    imageUrl: uploadData.imageUrl,
                    cloudinaryUrl: uploadData.cloudinaryUrl,
                    fileName: uploadData.originalName || uploadData.fileName,
                    uploadedAt: uploadData.uploadedAt,
                    message: 'Image found'
                }
            });
        }
        else {
            res.status(200).json({
                success: true,
                data: {
                    exists: false,
                    code: code,
                    message: 'No image uploaded for this code yet'
                }
            });
        }
    }
    catch (error) {
        console.error('❌ Check upload error:', error);
        res.status(200).json({
            success: true,
            data: {
                exists: false,
                code: req.params.code,
                message: 'Check failed'
            }
        });
    }
});
exports.checkUpload = checkUpload;
const getImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        // Set permissive CORS for textures
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        console.log(`📷 Getting image for code: ${code}`);
        let uploadData = null;
        const db = (0, db_1.getDB)();
        if (db) {
            try {
                const result = yield db.collection('uploads').findOne({ code });
                uploadData = result;
            }
            catch (dbErr) {
                console.error('DB error in getImage:', dbErr);
            }
        }
        // Also check in-memory fallback
        if (!uploadData) {
            uploadData = exports.uploads.get(code) || null;
        }
        // 1. Handle Cloudinary
        if (uploadData === null || uploadData === void 0 ? void 0 : uploadData.cloudinaryUrl) {
            // Instead of redirecting (which breaks CORS), we can try to proxy it or 
            // just redirect and hope the client handles it (but texture loader usually fails).
            // For best results with Three.js, we should redirect but ensure CORS headers are set.
            return res.redirect(uploadData.cloudinaryUrl);
        }
        // 2. Serve local file
        if (uploadData && uploadData.filePath && fs_1.default.existsSync(uploadData.filePath)) {
            const mimeType = uploadData.mimeType || 'image/png';
            res.setHeader('Content-Type', mimeType);
            const fileStream = fs_1.default.createReadStream(uploadData.filePath);
            fileStream.pipe(res);
            fileStream.on('error', (err) => {
                console.error('File stream error:', err);
                if (!res.headersSent) {
                    res.status(404).end();
                }
            });
            return;
        }
        // 3. Fallback / Not found
        console.log(`⚠️ No image found for code: ${code}, returning 404`);
        res.status(404).send('Image not found');
    }
    catch (error) {
        console.error('❌ Get image error:', error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});
exports.getImage = getImage;
// Clean up old files periodically
const cleanupOldFiles = () => {
    const now = new Date();
    const uploadDir = path_1.default.join(process.cwd(), 'uploads');
    try {
        if (!fs_1.default.existsSync(uploadDir))
            return;
        const files = fs_1.default.readdirSync(uploadDir);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        files.forEach(file => {
            const filePath = path_1.default.join(uploadDir, file);
            try {
                const stats = fs_1.default.statSync(filePath);
                if (stats.mtime < oneDayAgo) {
                    fs_1.default.unlinkSync(filePath);
                    console.log(`🧹 Cleaned up old file: ${file}`);
                }
            }
            catch (error) {
                console.error(`Error cleaning up file ${file}:`, error);
            }
        });
    }
    catch (error) {
        console.error('Cleanup error:', error);
    }
};
exports.cleanupOldFiles = cleanupOldFiles;
//# sourceMappingURL=uploadController.js.map