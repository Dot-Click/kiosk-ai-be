// src/controllers/uploadController.ts
import { Request, Response, NextFunction } from 'express';
import UploadedImage from '../models/UploadedImage';
import QRCode from '../models/QrCode';
import fs from 'fs/promises';
import fsSync from 'fs'; 
import { ApiError } from '../utils/ApiError';

class UploadController {
  // Upload image from mobile
  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      
      console.log(`📱 Upload request for code: ${code} from IP: ${req.ip}`);
      
      if (!code || !/^\d{6}$/.test(code)) {
        throw new ApiError(400, 'Valid 6-digit code is required');
      }
      
      if (!req.file) {
        throw new ApiError(400, 'No image file uploaded');
      }

      // Validate QR code
      const qrCode = await QRCode.findOne({ 
        code, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      });
      
      if (!qrCode) {
        // Delete uploaded file
        await fs.unlink(req.file.path).catch(() => {});
        throw new ApiError(404, 'Invalid or expired QR code');
      }

      const imageUrl = `${process.env.BASE_URL || 'https://kiosk-ai-be-production.up.railway.app'}/uploads/images/${req.file.filename}`;
      
      // Check if image already exists for this code
      const existingImage = await UploadedImage.findOne({ code });
      
      if (existingImage) {
        // Delete old image file
        await fs.unlink(existingImage.imagePath).catch(() => {});
        
        // Update existing record
        existingImage.imageUrl = imageUrl;
        existingImage.imagePath = req.file.path;
        existingImage.fileName = req.file.originalname;
        existingImage.fileSize = req.file.size;
        existingImage.mimeType = req.file.mimetype;
        existingImage.status = 'uploaded';
        existingImage.uploadedBy = req.ip || 'unknown';
        await existingImage.save();
        
        console.log(`✅ Image updated for code: ${code}`);
        
        // Deactivate QR code
        await QRCode.updateOne({ code }, { isActive: false });
        
        return res.json({
          success: true,
          message: 'Image updated successfully',
          data: {
            code,
            imageUrl,
            fileName: existingImage.fileName,
            fileSize: this.formatFileSize(existingImage.fileSize),
            status: 'updated',
            uploadedAt: existingImage.updatedAt
          }
        });
      }

      // Create new image record
      const uploadedImage = new UploadedImage({
        code,
        imageUrl,
        imagePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: 'uploaded',
        uploadedBy: req.ip || 'unknown',
        metadata: {
          originalName: req.file.originalname,
          uploadTime: new Date()
        }
      });

      await uploadedImage.save();
      
      // Deactivate QR code
      await QRCode.updateOne({ code }, { isActive: false });
      
      console.log(`✅ New image uploaded for code: ${code}, Size: ${req.file.size} bytes`);
      
      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          code,
          imageUrl,
          fileName: uploadedImage.fileName,
          fileSize: this.formatFileSize(uploadedImage.fileSize),
          status: 'uploaded',
          uploadedAt: uploadedImage.createdAt,
          expiresAt: uploadedImage.expiresAt
        }
      });

    } catch (error: any) {
      console.error(`❌ Upload failed: ${error.message}`);
      
      // Clean up uploaded file if error occurred
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      
      next(error);
    }
  };

  // Check if image is uploaded for a code
  checkUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      
      console.log(`🔍 Checking upload for code: ${code}`);

      if (!code || !/^\d{6}$/.test(code)) {
        throw new ApiError(400, 'Invalid QR code format. Must be 6 digits.');
      }

      const image = await UploadedImage.findOne({ code, status: 'uploaded' });

      if (!image) {
        return res.json({
          success: true,
          message: 'No image found',
          data: {
            exists: false,
            code,
            message: 'No image uploaded for this code yet'
          }
        });
      }

      // Check if image file still exists
      try {
        await fs.access(image.imagePath);
      } catch (error) {
        // File doesn't exist, update status
        image.status = 'expired';
        await image.save();
        
        return res.json({
          success: true,
          message: 'Image expired or deleted',
          data: {
            exists: false,
            code,
            message: 'Image file not found on server'
          }
        });
      }

      res.json({
        success: true,
        message: 'Image found',
        data: {
          exists: true,
          code,
          imageUrl: image.imageUrl,
          fileName: image.fileName,
          fileSize: this.formatFileSize(image.fileSize),
          mimeType: image.mimeType,
          uploadedAt: image.createdAt,
          expiresAt: image.expiresAt,
          status: image.status
        }
      });

    } catch (error: any) {
      console.error(`❌ Check upload failed: ${error.message}`);
      next(error);
    }
  };

  // Get image by code
  getImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;

      const image = await UploadedImage.findOne({ code, status: 'uploaded' });

      if (!image) {
        throw new ApiError(404, 'Image not found');
      }

      // Check if file exists
      try {
        await fs.access(image.imagePath);
      } catch {
        throw new ApiError(404, 'Image file not found on server');
      }

      // Stream the image file
      const stream = fsSync.createReadStream(image.imagePath);
      res.setHeader('Content-Type', image.mimeType);
      stream.pipe(res);
      
      stream.on('error', (error: any) => {
        console.error(`❌ Stream error for image ${code}: ${error.message}`);
        next(new ApiError(500, 'Error streaming image'));
      });

    } catch (error: any) {
      next(error);
    }
  };

  // Helper method
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
}

export default new UploadController();