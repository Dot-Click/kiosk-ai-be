// import multer from 'multer';
// import path from 'path';
// import { Request } from 'express';
// import { v4 as uuidv4 } from 'uuid';
// import fs from 'fs';

// // Ensure uploads directory exists
// const uploadDir = process.env.UPLOAD_DIR || 'uploads/images';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (req: Request, file: Express.Multer.File, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req: Request, file: Express.Multer.File, cb) => {
//     const uniqueId = uuidv4();
//     const extension = path.extname(file.originalname);
//     const filename = `${Date.now()}-${uniqueId}${extension}`;
//     cb(null, filename);
//   }
// });

// // File filter
// const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,image/gif,image/webp')
//     .split(',');
  
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
//   }
// };

// // Create multer instance
// export const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
//     files: 1
//   }
// });

// // Single file upload middleware
// export const uploadSingle = (fieldName: string) => upload.single(fieldName);

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueId + ext);
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);