import mongoose from 'mongoose';
import {UploadedImage} from '../models/UploadedImage';
import QRCode from '../models/QrCode';
import { logger } from '../functions/logger';
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  try {
    logger.info('Starting cleanup job...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info('Connected to MongoDB');
    
    // Cleanup expired uploads
    const cleanedCount = await UploadedImage.cleanupExpired();
    logger.info(`Cleaned up ${cleanedCount} expired images`);
    
    // Find and deactivate expired QR codes
    const expiredQRCodes = await QRCode.updateMany(
      { 
        expiresAt: { $lt: new Date() },
        isActive: true 
      },
      { isActive: false }
    );
    
    logger.info(`Deactivated ${expiredQRCodes.modifiedCount} expired QR codes`);
    
    // Close connection
    await mongoose.connection.close();
    logger.info('Cleanup completed successfully');
    
    process.exit(0);
    
  } catch (error: any) {
    logger.error(`Cleanup failed: ${error.message}`);
    process.exit(1);
  }
}

cleanup();