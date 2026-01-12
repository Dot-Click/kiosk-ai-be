import fs from 'fs/promises';
import path from 'path';

class FileHandler {
  static async ensureUploadsDirectory(): Promise<void> {
    const uploadsDir = path.join(__dirname, '../../uploads/images');
    
    try {
      await fs.access(uploadsDir);
      console.log('✅ Uploads directory already exists');
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory');
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`🗑️  Deleted file: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to delete file: ${filePath}`, error);
    }
  }

  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
}

export default FileHandler;