// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv';

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


import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

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
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
    
    console.log('✅ Cloudinary configured successfully');
  } catch (error) {
    console.error('❌ Cloudinary configuration failed:', error);
  }
}

export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Check file size (Cloudinary limit: 10MB for free tier)
  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);
  
  if (fileSizeInMB > 10) {
    throw new Error(`File too large: ${fileSizeInMB.toFixed(2)}MB. Max 10MB for Cloudinary.`);
  }
  
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary not configured. Check environment variables.');
  }
  
  try {
    console.log(`☁️ Uploading to Cloudinary: ${path.basename(filePath)} (${fileSizeInMB.toFixed(2)}MB)`);
    
    const folder = process.env.CLOUDINARY_FOLDER || 'kiosk-ai-uploads';
    
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
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
  } catch (error: any) {
    console.error('❌ Cloudinary upload failed:', error.message);
    
    // Specific error handling
    if (error.http_code === 401) {
      console.error('❌ Cloudinary authentication failed. Check API key/secret.');
    } else if (error.http_code === 404) {
      console.error('❌ Cloudinary cloud not found. Check cloud name.');
    } else if (error.http_code === 413) {
      console.error('❌ File too large for Cloudinary.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('❌ Network error. Check internet connection.');
    }
    
    throw error;
  }
};

export const isCloudinaryAvailable = (): boolean => {
  return isCloudinaryConfigured;
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!isCloudinaryConfigured) return;
  
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('❌ Failed to delete from Cloudinary:', error);
  }
};