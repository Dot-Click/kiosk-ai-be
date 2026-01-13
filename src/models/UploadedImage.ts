// // src/models/UploadedImage.ts
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
//     minlength: [6, 'Code must be 6 digits'],
//     maxlength: [6, 'Code must be 6 digits'],
//     match: [/^\d{6}$/, 'Code must be 6 digits'],
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

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUploadedImage extends Document {
  code: string;
  imageUrl: string;
  imagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'uploaded' | 'processed' | 'expired';
  uploadedBy?: string;
  expiresAt: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for static methods
interface IUploadedImageModel extends Model<IUploadedImage> {
  findByCode(code: string): Promise<IUploadedImage | null>;
  getUploadStatus(code: string): Promise<{ exists: boolean; image?: IUploadedImage }>;
  cleanupExpired(): Promise<number>;
}

const UploadedImageSchema: Schema<IUploadedImage> = new Schema({
  code: {
    type: String,
    required: [true, 'Code is required'],
    unique: true,
    trim: true,
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
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
UploadedImageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
UploadedImageSchema.index({ code: 1, status: 1 });

// Static method to find by code
UploadedImageSchema.static('findByCode', function(code: string): Promise<IUploadedImage | null> {
  return this.findOne({ code, status: 'uploaded' });
});

// Static method to get upload status
UploadedImageSchema.static('getUploadStatus', async function(code: string): Promise<{ exists: boolean; image?: IUploadedImage }> {
  const image = await this.findOne({ code, status: 'uploaded' });
  return {
    exists: !!image,
    image: image || undefined
  };
});

// Static method to cleanup expired
UploadedImageSchema.static('cleanupExpired', async function(): Promise<number> {
  const fs = require('fs').promises;
  const expiredImages = await this.find({
    expiresAt: { $lt: new Date() },
    status: { $ne: 'expired' }
  });

  let cleanedCount = 0;
  
  for (const image of expiredImages) {
    try {
      // Delete file
      await fs.unlink(image.imagePath);
      
      // Update status
      image.status = 'expired';
      await image.save();
      
      cleanedCount++;
    } catch (error) {
      console.error(`Failed to cleanup image ${image.code}:`, error);
    }
  }

  return cleanedCount;
});

// Create and export the model
const UploadedImage = mongoose.model<IUploadedImage, IUploadedImageModel>('UploadedImage', UploadedImageSchema);
export default UploadedImage;