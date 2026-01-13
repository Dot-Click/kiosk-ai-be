// src/controllers/qrController.ts
import { Request, Response, NextFunction } from 'express';
import QRCode from '../models/QrCode';
import { ApiError } from '../utils/ApiError';

// Use require for qrcode to avoid TypeScript issues
const QRCodeGenerator = require('qrcode');

class QRController {
  // Generate new QR code
  generateQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔄 Generating QR code...');
      
      // Generate code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Create upload URL for frontend port 4001
      const uploadUrl = `${process.env.FRONTEND_URL || 'https://kiosk-ai.vercel.app'}/upload?code=${code}`;
      
      // Generate QR code image
      const qrImageUrl = await QRCodeGenerator.toDataURL(uploadUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2d2d6d',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      // Create QR code in database
      const qrCode = new QRCode({
        code,
        qrImageUrl,
        uploadUrl,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });

      await qrCode.save();
      
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
      
    } catch (error: any) {
      console.error('❌ QR generation failed:', error);
      next(new ApiError(500, 'Failed to generate QR code'));
    }
  };

  // Validate QR code
  validateQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      
      if (!code || code.length !== 6) {
        throw new ApiError(400, 'Invalid QR code format');
      }
      
      // Check if QR code exists and is valid
      const qrCode = await QRCode.findOne({ 
        code, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      });
      
      if (!qrCode) {
        throw new ApiError(404, 'QR code not found or expired');
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
      
    } catch (error: any) {
      next(error);
    }
  };

  // Get QR code details
  getQRDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      
      const qrCode = await QRCode.findOne({ code });
      
      if (!qrCode) {
        throw new ApiError(404, 'QR code not found');
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
      
    } catch (error: any) {
      next(error);
    }
  };

  // Deactivate QR code
  deactivateQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      
      const qrCode = await QRCode.findOneAndUpdate(
        { code },
        { isActive: false },
        { new: true }
      );
      
      if (!qrCode) {
        throw new ApiError(404, 'QR code not found');
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
      
    } catch (error: any) {
      next(error);
    }
  };
}

export default new QRController();