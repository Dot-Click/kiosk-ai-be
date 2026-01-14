// // // src/controllers/uploadController.ts
// // import { Request, Response, NextFunction } from 'express';
// // import UploadedImage from '../models/UploadedImage';
// // import QRCode from '../models/QrCode';
// // import fs from 'fs/promises';
// // import fsSync from 'fs'; 
// // import { ApiError } from '../utils/ApiError';

// // class UploadController {
// //   // Upload image from mobile
// //   uploadImage = async (req: Request, res: Response, next: NextFunction) => {
// //     try {
// //       const { code } = req.body;
      
// //       console.log(`📱 Upload request for code: ${code} from IP: ${req.ip}`);
      
// //       if (!code || !/^\d{6}$/.test(code)) {
// //         throw new ApiError(400, 'Valid 6-digit code is required');
// //       }
      
// //       if (!req.file) {
// //         throw new ApiError(400, 'No image file uploaded');
// //       }

// //       // Validate QR code
// //       const qrCode = await QRCode.findOne({ 
// //         code, 
// //         isActive: true,
// //         expiresAt: { $gt: new Date() }
// //       });
      
// //       if (!qrCode) {
// //         // Delete uploaded file
// //         await fs.unlink(req.file.path).catch(() => {});
// //         throw new ApiError(404, 'Invalid or expired QR code');
// //       }

// //       const imageUrl = `${process.env.BASE_URL || 'https://kiosk-ai-be-production.up.railway.app'}/uploads/images/${req.file.filename}`;
      
// //       // Check if image already exists for this code
// //       const existingImage = await UploadedImage.findOne({ code });
      
// //       if (existingImage) {
// //         // Delete old image file
// //         await fs.unlink(existingImage.imagePath).catch(() => {});
        
// //         // Update existing record
// //         existingImage.imageUrl = imageUrl;
// //         existingImage.imagePath = req.file.path;
// //         existingImage.fileName = req.file.originalname;
// //         existingImage.fileSize = req.file.size;
// //         existingImage.mimeType = req.file.mimetype;
// //         existingImage.status = 'uploaded';
// //         existingImage.uploadedBy = req.ip || 'unknown';
// //         await existingImage.save();
        
// //         console.log(`✅ Image updated for code: ${code}`);
        
// //         // Deactivate QR code
// //         await QRCode.updateOne({ code }, { isActive: false });
        
// //         return res.json({
// //           success: true,
// //           message: 'Image updated successfully',
// //           data: {
// //             code,
// //             imageUrl,
// //             fileName: existingImage.fileName,
// //             fileSize: this.formatFileSize(existingImage.fileSize),
// //             status: 'updated',
// //             uploadedAt: existingImage.updatedAt
// //           }
// //         });
// //       }

// //       // Create new image record
// //       const uploadedImage = new UploadedImage({
// //         code,
// //         imageUrl,
// //         imagePath: req.file.path,
// //         fileName: req.file.originalname,
// //         fileSize: req.file.size,
// //         mimeType: req.file.mimetype,
// //         status: 'uploaded',
// //         uploadedBy: req.ip || 'unknown',
// //         metadata: {
// //           originalName: req.file.originalname,
// //           uploadTime: new Date()
// //         }
// //       });

// //       await uploadedImage.save();
      
// //       // Deactivate QR code
// //       await QRCode.updateOne({ code }, { isActive: false });
      
// //       console.log(`✅ New image uploaded for code: ${code}, Size: ${req.file.size} bytes`);
      
// //       res.status(201).json({
// //         success: true,
// //         message: 'Image uploaded successfully',
// //         data: {
// //           code,
// //           imageUrl,
// //           fileName: uploadedImage.fileName,
// //           fileSize: this.formatFileSize(uploadedImage.fileSize),
// //           status: 'uploaded',
// //           uploadedAt: uploadedImage.createdAt,
// //           expiresAt: uploadedImage.expiresAt
// //         }
// //       });

// //     } catch (error: any) {
// //       console.error(`❌ Upload failed: ${error.message}`);
      
// //       // Clean up uploaded file if error occurred
// //       if (req.file) {
// //         await fs.unlink(req.file.path).catch(() => {});
// //       }
      
// //       next(error);
// //     }
// //   };

// //   // Check if image is uploaded for a code
// //   checkUpload = async (req: Request, res: Response, next: NextFunction) => {
// //     try {
// //       const { code } = req.params;
      
// //       console.log(`🔍 Checking upload for code: ${code}`);

// //       if (!code || !/^\d{6}$/.test(code)) {
// //         throw new ApiError(400, 'Invalid QR code format. Must be 6 digits.');
// //       }

// //       const image = await UploadedImage.findOne({ code, status: 'uploaded' });

// //       if (!image) {
// //         return res.json({
// //           success: true,
// //           message: 'No image found',
// //           data: {
// //             exists: false,
// //             code,
// //             message: 'No image uploaded for this code yet'
// //           }
// //         });
// //       }

// //       // Check if image file still exists
// //       try {
// //         await fs.access(image.imagePath);
// //       } catch (error) {
// //         // File doesn't exist, update status
// //         image.status = 'expired';
// //         await image.save();
        
// //         return res.json({
// //           success: true,
// //           message: 'Image expired or deleted',
// //           data: {
// //             exists: false,
// //             code,
// //             message: 'Image file not found on server'
// //           }
// //         });
// //       }

// //       res.json({
// //         success: true,
// //         message: 'Image found',
// //         data: {
// //           exists: true,
// //           code,
// //           imageUrl: image.imageUrl,
// //           fileName: image.fileName,
// //           fileSize: this.formatFileSize(image.fileSize),
// //           mimeType: image.mimeType,
// //           uploadedAt: image.createdAt,
// //           expiresAt: image.expiresAt,
// //           status: image.status
// //         }
// //       });

// //     } catch (error: any) {
// //       console.error(`❌ Check upload failed: ${error.message}`);
// //       next(error);
// //     }
// //   };

// //   // Get image by code
// //   getImage = async (req: Request, res: Response, next: NextFunction) => {
// //     try {
// //       const { code } = req.params;

// //       const image = await UploadedImage.findOne({ code, status: 'uploaded' });

// //       if (!image) {
// //         throw new ApiError(404, 'Image not found');
// //       }

// //       // Check if file exists
// //       try {
// //         await fs.access(image.imagePath);
// //       } catch {
// //         throw new ApiError(404, 'Image file not found on server');
// //       }

// //       // Stream the image file
// //       const stream = fsSync.createReadStream(image.imagePath);
// //       res.setHeader('Content-Type', image.mimeType);
// //       stream.pipe(res);
      
// //       stream.on('error', (error: any) => {
// //         console.error(`❌ Stream error for image ${code}: ${error.message}`);
// //         next(new ApiError(500, 'Error streaming image'));
// //       });

// //     } catch (error: any) {
// //       next(error);
// //     }
// //   };

// //   // Helper method
// //   private formatFileSize(bytes: number): string {
// //     if (bytes < 1024) return bytes + ' bytes';
// //     else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
// //     else return (bytes / 1048576).toFixed(1) + ' MB';
// //   }
// // }

// // export default new UploadController();


// import { Request, Response, NextFunction } from 'express';
// import UploadedImage from '../models/UploadedImage';
// import QRCode from '../models/QrCode';
// import fs from 'fs/promises';
// import fsSync from 'fs'; 
// import { ApiError } from '../utils/ApiError';
// import path from 'path';

// class UploadController {
//   // Upload image from mobile - FIXED to accept any code format
//   uploadImage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.body;
      
//       console.log(`📱 Upload request for code: ${code} from IP: ${req.ip}`);
      
//       if (!code) {
//         throw new ApiError(400, 'Code is required');
//       }
      
//       if (!req.file) {
//         throw new ApiError(400, 'No image file uploaded');
//       }

//       // Validate QR code - accept any code, not just 6 digits
//       const qrCode = await QRCode.findOne({ 
//         code, 
//         isActive: true,
//         expiresAt: { $gt: new Date() }
//       });
      
//       if (!qrCode) {
//         // Delete uploaded file
//         await fs.unlink(req.file.path).catch(() => {});
//         throw new ApiError(404, 'Invalid or expired QR code');
//       }

//       // FIX: Use correct URL for image access
//       const imageUrl = `${process.env.API_URL || 'https://kiosk-ai-be-production.up.railway.app'}/api/v1/upload/image/${code}`;
      
//       // Check if image already exists for this code
//       const existingImage = await UploadedImage.findOne({ code });
      
//       if (existingImage) {
//         // Delete old image file
//         await fs.unlink(existingImage.imagePath).catch(() => {});
        
//         // Update existing record
//         existingImage.imageUrl = imageUrl;
//         existingImage.imagePath = req.file.path;
//         existingImage.fileName = req.file.originalname;
//         existingImage.fileSize = req.file.size;
//         existingImage.mimeType = req.file.mimetype;
//         existingImage.status = 'uploaded';
//         existingImage.uploadedBy = req.ip || 'unknown';
//         await existingImage.save();
        
//         console.log(`✅ Image updated for code: ${code}`);
        
//         // Deactivate QR code
//         await QRCode.updateOne({ code }, { isActive: false });
        
//         return res.json({
//           success: true,
//           message: 'Image updated successfully',
//           data: {
//             code,
//             imageUrl,
//             fileName: existingImage.fileName,
//             fileSize: this.formatFileSize(existingImage.fileSize),
//             status: 'updated',
//             uploadedAt: existingImage.updatedAt
//           }
//         });
//       }

//       // Create new image record - FIX: Accept any code length
//       const uploadedImage = new UploadedImage({
//         code,
//         imageUrl,
//         imagePath: req.file.path,
//         fileName: req.file.originalname,
//         fileSize: req.file.size,
//         mimeType: req.file.mimetype,
//         status: 'uploaded',
//         uploadedBy: req.ip || 'unknown',
//         metadata: {
//           originalName: req.file.originalname,
//           uploadTime: new Date()
//         }
//       });

//       await uploadedImage.save();
      
//       // Deactivate QR code
//       await QRCode.updateOne({ code }, { isActive: false });
      
//       console.log(`✅ New image uploaded for code: ${code}, Size: ${req.file.size} bytes`);
      
//       res.status(201).json({
//         success: true,
//         message: 'Image uploaded successfully',
//         data: {
//           code,
//           imageUrl,
//           fileName: uploadedImage.fileName,
//           fileSize: this.formatFileSize(uploadedImage.fileSize),
//           status: 'uploaded',
//           uploadedAt: uploadedImage.createdAt,
//           expiresAt: uploadedImage.expiresAt
//         }
//       });

//     } catch (error: any) {
//       console.error(`❌ Upload failed: ${error.message}`);
      
//       // Clean up uploaded file if error occurred
//       if (req.file) {
//         await fs.unlink(req.file.path).catch(() => {});
//       }
      
//       next(error);
//     }
//   };

//   // Check if image is uploaded for a code - FIXED to accept any code
//   checkUpload = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.params;
      
//       console.log(`🔍 Checking upload for code: ${code}`);

//       if (!code) {
//         throw new ApiError(400, 'Code is required');
//       }

//       const image = await UploadedImage.findOne({ code, status: 'uploaded' });

//       if (!image) {
//         return res.json({
//           success: true,
//           message: 'No image found',
//           data: {
//             exists: false,
//             code,
//             message: 'No image uploaded for this code yet'
//           }
//         });
//       }

//       // Check if image file still exists
//       try {
//         await fs.access(image.imagePath);
//       } catch (error) {
//         // File doesn't exist, update status
//         image.status = 'expired';
//         await image.save();
        
//         return res.json({
//           success: true,
//           message: 'Image expired or deleted',
//           data: {
//             exists: false,
//             code,
//             message: 'Image file not found on server'
//           }
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Image found',
//         data: {
//           exists: true,
//           code,
//           imageUrl: image.imageUrl,
//           fileName: image.fileName,
//           fileSize: this.formatFileSize(image.fileSize),
//           mimeType: image.mimeType,
//           uploadedAt: image.createdAt,
//           expiresAt: image.expiresAt,
//           status: image.status
//         }
//       });

//     } catch (error: any) {
//       console.error(`❌ Check upload failed: ${error.message}`);
//       next(error);
//     }
//   };

//   // Get image by code
//   getImage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { code } = req.params;

//       const image = await UploadedImage.findOne({ code, status: 'uploaded' });

//       if (!image) {
//         // Return placeholder image
//         return res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Image+Not+Found');
//       }

//       // Check if file exists
//       try {
//         await fs.access(image.imagePath);
//       } catch {
//         // Return placeholder if file doesn't exist
//         return res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=File+Deleted');
//       }

//       // Set proper content type and stream the image
//       res.setHeader('Content-Type', image.mimeType);
//       res.setHeader('Cache-Control', 'public, max-age=3600');
      
//       const stream = fsSync.createReadStream(image.imagePath);
//       stream.pipe(res);
      
//       stream.on('error', (error: any) => {
//         console.error(`❌ Stream error for image ${code}: ${error.message}`);
//         res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Error+Loading');
//       });

//     } catch (error: any) {
//       console.error(`❌ Get image error: ${error.message}`);
//       res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Server+Error');
//     }
//   };

//   // Helper method
//   private formatFileSize(bytes: number): string {
//     if (bytes < 1024) return bytes + ' bytes';
//     else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
//     else return (bytes / 1048576).toFixed(1) + ' MB';
//   }
// }

// export default new UploadController();
import { Request, Response } from 'express';
import { getDB } from '../config/db';
import fs from 'fs';
import path from 'path';
import { uploadToCloudinary } from '../utils/cloudinary';
import { ObjectId } from 'mongodb';

interface UploadData {
  _id?: ObjectId;
  code: string;
  imageUrl: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  expiresAt: Date;
  cloudinaryUrl?: string;
  originalName?: string;
  status?: string;
  uploadedBy?: string;
}

// In-memory storage fallback
const uploads = new Map<string, UploadData>();

export const uploadImage = async (req: Request, res: Response) => {
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
    
    let imageUrl: string;
    let cloudinaryUrl: string | undefined;
    
    // Upload to Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        cloudinaryUrl = await uploadToCloudinary(req.file.path);
        imageUrl = cloudinaryUrl;
        console.log(`☁️ Image uploaded to Cloudinary: ${cloudinaryUrl}`);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, using local:', cloudinaryError);
        imageUrl = `https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/${code}`;
      }
    } else {
      imageUrl = `https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/${code}`;
    }
    
    const uploadData: UploadData = {
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
    const db = getDB();
    if (db) {
      const result = await db.collection('uploads').insertOne(uploadData);
      uploadData._id = result.insertedId;
      console.log(`💾 Saved to database for code: ${code}`);
    } else {
      uploads.set(code, uploadData);
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
    
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed: ' + error.message
    });
  }
};

export const checkUpload = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    console.log(`🔍 Checking upload for code: ${code}`);
    
    let uploadData: UploadData | null = null;
    const db = getDB();
    
    if (db) {
      const result = await db.collection('uploads').findOne({ code });
      // Type assertion or conversion
      uploadData = result as UploadData;
    } else {
      uploadData = uploads.get(code) || null;
    }
    
    if (uploadData) {
      // Check if file still exists locally (if not using Cloudinary)
      if (!uploadData.cloudinaryUrl && !fs.existsSync(uploadData.filePath)) {
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
    } else {
      res.status(200).json({
        success: true,
        data: {
          exists: false,
          code: code,
          message: 'No image uploaded for this code yet'
        }
      });
    }
    
  } catch (error: any) {
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
};

export const getImage = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    console.log(`📷 Getting image for code: ${code}`);
    
    let uploadData: UploadData | null = null;
    const db = getDB();
    
    if (db) {
      const result = await db.collection('uploads').findOne({ code });
      uploadData = result as UploadData;
    } else {
      uploadData = uploads.get(code) || null;
    }
    
    // Redirect to Cloudinary URL if available
    if (uploadData?.cloudinaryUrl) {
      return res.redirect(uploadData.cloudinaryUrl);
    }
    
    // Serve local file
    if (uploadData && fs.existsSync(uploadData.filePath)) {
      res.setHeader('Content-Type', uploadData.mimeType);
      const fileStream = fs.createReadStream(uploadData.filePath);
      fileStream.pipe(res);
      
      fileStream.on('error', (err) => {
        console.error('File stream error:', err);
        res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Error');
      });
      return;
    }
    
    // Return placeholder
    console.log(`⚠️ No image found for code: ${code}, using placeholder`);
    res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Uploaded+Image');
    
  } catch (error: any) {
    console.error('❌ Get image error:', error);
    res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Error');
  }
};

// Clean up old files periodically
export const cleanupOldFiles = () => {
  const now = new Date();
  const uploadDir = path.join(process.cwd(), 'uploads');
  
  try {
    if (!fs.existsSync(uploadDir)) return;
    
    const files = fs.readdirSync(uploadDir);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      try {
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < oneDayAgo) {
          fs.unlinkSync(filePath);
          console.log(`🧹 Cleaned up old file: ${file}`);
        }
      } catch (error) {
        console.error(`Error cleaning up file ${file}:`, error);
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};