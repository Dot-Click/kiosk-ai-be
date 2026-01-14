// // // src/models/UploadedImage.ts
// // import mongoose, { Schema, Document, Model } from 'mongoose';

// // export interface IUploadedImage extends Document {
// //   code: string;
// //   imageUrl: string;
// //   imagePath: string;
// //   fileName: string;
// //   fileSize: number;
// //   mimeType: string;
// //   status: 'pending' | 'uploaded' | 'processed' | 'expired';
// //   uploadedBy?: string;
// //   expiresAt: Date;
// //   metadata?: Record<string, any>;
// //   createdAt: Date;
// //   updatedAt: Date;
// // }

// // // Interface for static methods
// // interface IUploadedImageModel extends Model<IUploadedImage> {
// //   findByCode(code: string): Promise<IUploadedImage | null>;
// //   getUploadStatus(code: string): Promise<{ exists: boolean; image?: IUploadedImage }>;
// //   cleanupExpired(): Promise<number>;
// // }

// // const UploadedImageSchema: Schema<IUploadedImage> = new Schema({
// //   code: {
// //     type: String,
// //     required: [true, 'Code is required'],
// //     unique: true,
// //     trim: true,
// //     minlength: [6, 'Code must be 6 digits'],
// //     maxlength: [6, 'Code must be 6 digits'],
// //     match: [/^\d{6}$/, 'Code must be 6 digits'],
// //     index: true
// //   },
// //   imageUrl: {
// //     type: String,
// //     required: [true, 'Image URL is required']
// //   },
// //   imagePath: {
// //     type: String,
// //     required: [true, 'Image path is required']
// //   },
// //   fileName: {
// //     type: String,
// //     required: [true, 'File name is required']
// //   },
// //   fileSize: {
// //     type: Number,
// //     required: [true, 'File size is required'],
// //     min: [1, 'File size must be at least 1 byte']
// //   },
// //   mimeType: {
// //     type: String,
// //     required: [true, 'MIME type is required'],
// //     enum: {
// //       values: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
// //       message: '{VALUE} is not a supported image type'
// //     }
// //   },
// //   status: {
// //     type: String,
// //     enum: ['pending', 'uploaded', 'processed', 'expired'],
// //     default: 'pending',
// //     index: true
// //   },
// //   uploadedBy: {
// //     type: String,
// //     default: 'anonymous'
// //   },
// //   expiresAt: {
// //     type: Date,
// //     default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
// //     index: true
// //   },
// //   metadata: {
// //     type: Schema.Types.Mixed,
// //     default: {}
// //   }
// // }, {
// //   timestamps: true
// // });

// // // Indexes
// // UploadedImageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// // UploadedImageSchema.index({ code: 1, status: 1 });

// // // Static method to find by code
// // UploadedImageSchema.static('findByCode', function(code: string): Promise<IUploadedImage | null> {
// //   return this.findOne({ code, status: 'uploaded' });
// // });

// // // Static method to get upload status
// // UploadedImageSchema.static('getUploadStatus', async function(code: string): Promise<{ exists: boolean; image?: IUploadedImage }> {
// //   const image = await this.findOne({ code, status: 'uploaded' });
// //   return {
// //     exists: !!image,
// //     image: image || undefined
// //   };
// // });

// // // Static method to cleanup expired
// // UploadedImageSchema.static('cleanupExpired', async function(): Promise<number> {
// //   const fs = require('fs').promises;
// //   const expiredImages = await this.find({
// //     expiresAt: { $lt: new Date() },
// //     status: { $ne: 'expired' }
// //   });

// //   let cleanedCount = 0;
  
// //   for (const image of expiredImages) {
// //     try {
// //       // Delete file
// //       await fs.unlink(image.imagePath);
      
// //       // Update status
// //       image.status = 'expired';
// //       await image.save();
      
// //       cleanedCount++;
// //     } catch (error) {
// //       console.error(`Failed to cleanup image ${image.code}:`, error);
// //     }
// //   }

// //   return cleanedCount;
// // });

// // // Create and export the model
// // const UploadedImage = mongoose.model<IUploadedImage, IUploadedImageModel>('UploadedImage', UploadedImageSchema);
// // export default UploadedImage;

// import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface IUploadedImage extends Document {
//   code: string;
//   imageUrl: string;
//   imagePath: string;
//   fileName: string;
//   fileSize: number;
//   mimeType: string;
//   status: 'pending' | 'uploaded' | 'processed' | 'expired';
//   uploadedBy?: string;
//   expiresAt: Date;
//   metadata?: Record<string, any>;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // Interface for static methods
// interface IUploadedImageModel extends Model<IUploadedImage> {
//   findByCode(code: string): Promise<IUploadedImage | null>;
//   getUploadStatus(code: string): Promise<{ exists: boolean; image?: IUploadedImage }>;
//   cleanupExpired(): Promise<number>;
// }

// const UploadedImageSchema: Schema<IUploadedImage> = new Schema({
//   code: {
//     type: String,
//     required: [true, 'Code is required'],
//     unique: true,
//     trim: true,
//     index: true
//   },
//   imageUrl: {
//     type: String,
//     required: [true, 'Image URL is required']
//   },
//   imagePath: {
//     type: String,
//     required: [true, 'Image path is required']
//   },
//   fileName: {
//     type: String,
//     required: [true, 'File name is required']
//   },
//   fileSize: {
//     type: Number,
//     required: [true, 'File size is required'],
//     min: [1, 'File size must be at least 1 byte']
//   },
//   mimeType: {
//     type: String,
//     required: [true, 'MIME type is required'],
//     enum: {
//       values: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
//       message: '{VALUE} is not a supported image type'
//     }
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'uploaded', 'processed', 'expired'],
//     default: 'pending',
//     index: true
//   },
//   uploadedBy: {
//     type: String,
//     default: 'anonymous'
//   },
//   expiresAt: {
//     type: Date,
//     default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
//     index: true
//   },
//   metadata: {
//     type: Schema.Types.Mixed,
//     default: {}
//   }
// }, {
//   timestamps: true
// });

// // Indexes
// UploadedImageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// UploadedImageSchema.index({ code: 1, status: 1 });

// // Static method to find by code
// UploadedImageSchema.static('findByCode', function(code: string): Promise<IUploadedImage | null> {
//   return this.findOne({ code, status: 'uploaded' });
// });

// // Static method to get upload status
// UploadedImageSchema.static('getUploadStatus', async function(code: string): Promise<{ exists: boolean; image?: IUploadedImage }> {
//   const image = await this.findOne({ code, status: 'uploaded' });
//   return {
//     exists: !!image,
//     image: image || undefined
//   };
// });

// // Static method to cleanup expired
// UploadedImageSchema.static('cleanupExpired', async function(): Promise<number> {
//   const fs = require('fs').promises;
//   const expiredImages = await this.find({
//     expiresAt: { $lt: new Date() },
//     status: { $ne: 'expired' }
//   });

//   let cleanedCount = 0;
  
//   for (const image of expiredImages) {
//     try {
//       // Delete file
//       await fs.unlink(image.imagePath);
      
//       // Update status
//       image.status = 'expired';
//       await image.save();
      
//       cleanedCount++;
//     } catch (error) {
//       console.error(`Failed to cleanup image ${image.code}:`, error);
//     }
//   }

//   return cleanedCount;
// });

// // Create and export the model
// const UploadedImage = mongoose.model<IUploadedImage, IUploadedImageModel>('UploadedImage', UploadedImageSchema);
// export default UploadedImage;
// src/models/Upload.ts

// import mongoose, { Document, Schema } from 'mongoose';

// export interface IUploadedImage extends Document {
//   code: string;
//   imageUrl: string;
//   fileName: string;
//   originalName: string;
//   filePath: string;
//   fileSize: number;
//   mimeType: string;
//   uploadedAt: Date;
//   expiresAt: Date;
//   cloudinaryUrl?: string;
//   status: string;
//   uploadedBy?: string;
//   metadata?: Record<string, any>;
// }

// const UploadedImageSchema = new Schema<IUploadedImage>({
//   code: {
//     type: String,
//     required: true,
//     index: true,
//     unique: true
//   },
//   imageUrl: {
//     type: String,
//     required: true
//   },
//   fileName: {
//     type: String,
//     required: true
//   },
//   originalName: {
//     type: String,
//     required: true
//   },
//   filePath: {
//     type: String,
//     required: true
//   },
//   fileSize: {
//     type: Number,
//     required: true
//   },
//   mimeType: {
//     type: String,
//     required: true
//   },
//   uploadedAt: {
//     type: Date,
//     default: Date.now
//   },
//   expiresAt: {
//     type: Date,
//     default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
//   },
//   cloudinaryUrl: {
//     type: String,
//     required: false
//   },
//   status: {
//     type: String,
//     enum: ['uploaded', 'processing', 'completed', 'failed'],
//     default: 'uploaded'
//   },
//   uploadedBy: {
//     type: String,
//     required: false
//   },
//   metadata: {
//     type: Schema.Types.Mixed,
//     default: {}
//   }
// }, {
//   timestamps: true
// });

// // Create index for expiration cleanup
// UploadedImageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// UploadedImageSchema.index({ code: 1 });

// export const UploadedImage = mongoose.model<IUploadedImage>('UploadedImage', UploadedImageSchema);

import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUploadedImage extends Document {
  code: string;
  imageUrl: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  expiresAt: Date;
  cloudinaryUrl?: string;
  status: string;
  uploadedBy?: string;
  metadata?: Record<string, any>;
}

export interface IUploadedImageModel extends Model<IUploadedImage> {
  cleanupExpired(): Promise<number>;
}

const UploadedImageSchema = new Schema<IUploadedImage, IUploadedImageModel>({
  code: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  cloudinaryUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed', 'expired'],
    default: 'uploaded'
  },
  uploadedBy: {
    type: String,
    required: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create index for expiration cleanup
UploadedImageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
UploadedImageSchema.index({ code: 1 });

// Static method to cleanup expired uploads
UploadedImageSchema.statics.cleanupExpired = async function(): Promise<number> {
  const now = new Date();
  
  // Find expired uploads
  const expiredUploads = await this.find({
    expiresAt: { $lt: now },
    status: { $ne: 'expired' }
  });
  
  let cleanedCount = 0;
  
  for (const upload of expiredUploads) {
    try {
      // Update status to expired
      upload.status = 'expired';
      await upload.save();
      cleanedCount++;
      
      // Optional: Delete the actual file
      if (upload.filePath) {
        const fs = require('fs').promises;
        try {
          await fs.unlink(upload.filePath);
          console.log(`Deleted file: ${upload.filePath}`);
        } catch (err) {
          console.log(`Could not delete file: ${upload.filePath}`);
        }
      }
    } catch (error) {
      console.error(`Error processing upload ${upload.code}:`, error);
    }
  }
  
  return cleanedCount;
};

export const UploadedImage = mongoose.model<IUploadedImage, IUploadedImageModel>('UploadedImage', UploadedImageSchema);