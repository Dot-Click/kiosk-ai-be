// // src/controllers/qrController.ts
// import { Request, Response, NextFunction } from 'express';
// import QRCode from '../models/QrCode';
// import { ApiError } from '../utils/ApiError';

// // Use require for qrcode to avoid TypeScript issues
// const QRCodeGenerator = require('qrcode');

// class QRController {
//   // Generate new QR code
//   generateQR = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       console.log('🔄 Generating QR code...');
      
//       // Generate code
//       const code = Math.floor(100000 + Math.random() * 900000).toString();
      
//       // Create upload URL for frontend port 4001
//       const uploadUrl = `${process.env.FRONTEND_URL || 'https://kiosk-ai.vercel.app'}/upload?code=${code}`;
      
//       // Generate QR code image
//       const qrImageUrl = await QRCodeGenerator.toDataURL(uploadUrl, {
//         width: 300,
//         margin: 2,
//         color: {
//           dark: '#2d2d6d',
//           light: '#ffffff'
//         },
//         errorCorrectionLevel: 'H'
//       });

//       // Create QR code in database
//       const qrCode = new QRCode({
//         code,
//         qrImageUrl,
//         uploadUrl,
//         isActive: true,
//         expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
//       });

//       await qrCode.save();
      
//       console.log('✅ QR Code generated:', code);
//       console.log('📱 Upload URL:', uploadUrl);
      
//       // Return the data
//       res.json({
//         success: true,
//         message: 'QR code generated successfully',
//         data: {
//           code: qrCode.code,
//           qrImageUrl: qrCode.qrImageUrl,
//           uploadUrl: qrCode.uploadUrl,
//           expiresAt: qrCode.expiresAt,
//           createdAt: qrCode.createdAt
//         }
//       });
      
//     } catch (error: any) {
//       console.error('❌ QR generation failed:', error);
//       next(new ApiError(500, 'Failed to generate QR code'));
//     }
//   };

//   // Validate QR code
//   validateQR = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.params;
      
//       if (!code || code.length !== 6) {
//         throw new ApiError(400, 'Invalid QR code format');
//       }
      
//       // Check if QR code exists and is valid
//       const qrCode = await QRCode.findOne({ 
//         code, 
//         isActive: true,
//         expiresAt: { $gt: new Date() }
//       });
      
//       if (!qrCode) {
//         throw new ApiError(404, 'QR code not found or expired');
//       }
      
//       res.json({
//         success: true,
//         message: 'QR code is valid',
//         data: {
//           code,
//           isValid: true,
//           expiresAt: qrCode.expiresAt
//         }
//       });
      
//     } catch (error: any) {
//       next(error);
//     }
//   };

//   // Get QR code details
//   getQRDetails = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.params;
      
//       const qrCode = await QRCode.findOne({ code });
      
//       if (!qrCode) {
//         throw new ApiError(404, 'QR code not found');
//       }
      
//       const isValid = qrCode.isActive && qrCode.expiresAt > new Date();
      
//       res.json({
//         success: true,
//         message: 'QR code details retrieved',
//         data: {
//           code: qrCode.code,
//           isActive: qrCode.isActive,
//           expiresAt: qrCode.expiresAt,
//           createdAt: qrCode.createdAt,
//           isValid: isValid,
//           uploadUrl: qrCode.uploadUrl
//         }
//       });
      
//     } catch (error: any) {
//       next(error);
//     }
//   };

//   // Deactivate QR code
//   deactivateQR = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.params;
      
//       const qrCode = await QRCode.findOneAndUpdate(
//         { code },
//         { isActive: false },
//         { new: true }
//       );
      
//       if (!qrCode) {
//         throw new ApiError(404, 'QR code not found');
//       }
      
//       res.json({
//         success: true,
//         message: 'QR code deactivated',
//         data: {
//           code: qrCode.code,
//           isActive: qrCode.isActive,
//           deactivatedAt: new Date()
//         }
//       });
      
//     } catch (error: any) {
//       next(error);
//     }
//   };
// }

// export default new QRController();

// import { Request, Response, NextFunction } from 'express';
// import QRCode from '../models/QrCode';
// import { ApiError } from '../utils/ApiError';

// const QRCodeGenerator = require('qrcode');

// class QRController {
//   // Generate new QR code - FIXED to use proper frontend URL
//   generateQR = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       console.log('🔄 Generating QR code...');
      
//       // Generate code - use timestamp instead of random
//       const code = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      
//       // IMPORTANT FIX: Use your actual frontend URL with /upload path
//       const uploadUrl = `${process.env.FRONTEND_URL || 'https://kiosk-ai.vercel.app'}/upload?code=${code}`;
      
//       // Generate QR code image - use text that will open the upload page
//       const qrImageUrl = await QRCodeGenerator.toDataURL(uploadUrl, {
//         width: 300,
//         margin: 2,
//         color: {
//           dark: '#2d2d6d',
//           light: '#ffffff'
//         },
//         errorCorrectionLevel: 'H'
//       });

//       // Also generate URL for external QR service (for better compatibility)
//       const externalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;

//       // Create QR code in database
//       const qrCode = new QRCode({
//         code,
//         qrImageUrl,
//         uploadUrl,
//         isActive: true,
//         expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
//       });

//       await qrCode.save();
      
//       console.log('✅ QR Code generated:', code);
//       console.log('📱 Upload URL:', uploadUrl);
//       console.log('🔗 QR Points to:', uploadUrl);
      
//       // Return the data - ADD external URL for frontend
//       res.json({
//         success: true,
//         message: 'QR code generated successfully',
//         data: {
//           id: code, // For compatibility with frontend
//           code: qrCode.code,
//           qrImageUrl: externalQrUrl, // Use external service URL for better compatibility
//           uploadUrl: qrCode.uploadUrl,
//           expiresAt: qrCode.expiresAt,
//           createdAt: qrCode.createdAt
//         }
//       });
      
//     } catch (error: any) {
//       console.error('❌ QR generation failed:', error);
//       next(new ApiError(500, 'Failed to generate QR code'));
//     }
//   };

//   // Validate QR code
//   validateQR = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.params;
      
//       if (!code) {
//         throw new ApiError(400, 'QR code is required');
//       }
      
//       // Check if QR code exists and is valid
//       const qrCode = await QRCode.findOne({ 
//         code, 
//         isActive: true,
//         expiresAt: { $gt: new Date() }
//       });
      
//       const isValid = !!qrCode;
      
//       res.json({
//         success: true,
//         message: isValid ? 'QR code is valid' : 'QR code not found or expired',
//         data: {
//           code,
//           isValid,
//           expiresAt: qrCode?.expiresAt || null
//         }
//       });
      
//     } catch (error: any) {
//       next(error);
//     }
//   };

//   // Get QR code details
//   getQRDetails = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.params;
      
//       const qrCode = await QRCode.findOne({ code });
      
//       if (!qrCode) {
//         throw new ApiError(404, 'QR code not found');
//       }
      
//       const isValid = qrCode.isActive && qrCode.expiresAt > new Date();
      
//       res.json({
//         success: true,
//         message: 'QR code details retrieved',
//         data: {
//           code: qrCode.code,
//           isActive: qrCode.isActive,
//           expiresAt: qrCode.expiresAt,
//           createdAt: qrCode.createdAt,
//           isValid: isValid,
//           uploadUrl: qrCode.uploadUrl
//         }
//       });
      
//     } catch (error: any) {
//       next(error);
//     }
//   };

//   // Deactivate QR code
//   deactivateQR = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.params;
      
//       const qrCode = await QRCode.findOneAndUpdate(
//         { code },
//         { isActive: false },
//         { new: true }
//       );
      
//       if (!qrCode) {
//         throw new ApiError(404, 'QR code not found');
//       }
      
//       res.json({
//         success: true,
//         message: 'QR code deactivated',
//         data: {
//           code: qrCode.code,
//           isActive: qrCode.isActive,
//           deactivatedAt: new Date()
//         }
//       });
      
//     } catch (error: any) {
//       next(error);
//     }
//   };
// }

// export default new QRController();


import { Request, Response, NextFunction } from 'express';
import QRCode from '../models/QrCode';
import { ApiError } from '../utils/ApiError';

const QRCodeGenerator = require('qrcode');

class QRController {
  // Generate new QR code - FIXED: Use FULL timestamp, not just last 6 digits
  generateQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔄 Generating QR code...');
      
      // FIX: Use FULL timestamp, not just last 6 digits
      const code = Date.now().toString(); // Full timestamp (e.g., 1768305296192)
      
      // IMPORTANT: Use your actual frontend URL with /upload path
      const uploadUrl = `${process.env.FRONTEND_URL || 'https://kiosk-ai.vercel.app'}/upload?code=${code}`;
      
      console.log('🔗 QR Data:', {
        code,
        uploadUrl,
        frontendUrl: process.env.FRONTEND_URL || 'https://kiosk-ai.vercel.app'
      });

      // Generate QR code image - use text that will open the upload page
      const qrImageUrl = await QRCodeGenerator.toDataURL(uploadUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2d2d6d',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      // Also generate URL for external QR service (for better compatibility)
      const externalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;

      // Create QR code in database
      const qrCode = new QRCode({
        code, // This is the FULL timestamp (e.g., 1768305296192)
        qrImageUrl,
        uploadUrl,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      });

      await qrCode.save();
      
      console.log('✅ QR Code generated successfully');
      console.log('📱 Code:', code);
      console.log('🔗 QR Points to:', uploadUrl);
      console.log('🖼️ External QR URL:', externalQrUrl);
      
      // Return the data - Use external URL for frontend
      res.json({
        success: true,
        message: 'QR code generated successfully',
        data: {
          id: code, // For compatibility with frontend (FULL timestamp)
          code: code, // Same as id
          qrImageUrl: externalQrUrl, // Use external service URL for better compatibility
          uploadUrl: uploadUrl,
          expiresAt: qrCode.expiresAt,
          createdAt: qrCode.createdAt
        }
      });
      
    } catch (error: any) {
      console.error('❌ QR generation failed:', error);
      next(new ApiError(500, 'Failed to generate QR code'));
    }
  };

  // Validate QR code - FIXED: Accept any code length
  validateQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        throw new ApiError(400, 'QR code is required');
      }
      
      console.log('🔍 Validating QR code:', code);
      
      // Check if QR code exists and is valid
      const qrCode = await QRCode.findOne({ 
        code, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      });
      
      const isValid = !!qrCode;
      
      console.log(`✅ QR Code ${code} is ${isValid ? 'valid' : 'invalid/expired'}`);
      
      res.json({
        success: true,
        message: isValid ? 'QR code is valid' : 'QR code not found or expired',
        data: {
          code,
          isValid,
          expiresAt: qrCode?.expiresAt || null,
          uploadUrl: qrCode?.uploadUrl || null
        }
      });
      
    } catch (error: any) {
      console.error('❌ QR validation failed:', error);
      next(error);
    }
  };

  // Get QR code details
  getQRDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      
      console.log('📋 Getting QR details for:', code);
      
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
      console.error('❌ Get QR details failed:', error);
      next(error);
    }
  };

  // Deactivate QR code
  deactivateQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      
      console.log('🚫 Deactivating QR code:', code);
      
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
      console.error('❌ Deactivate QR failed:', error);
      next(error);
    }
  };
}

export default new QRController();
