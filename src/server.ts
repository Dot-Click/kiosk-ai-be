// // import express from 'express';
// // import cors from 'cors';
// // import helmet from 'helmet';
// // import morgan from 'morgan';
// // import dotenv from 'dotenv';

// // dotenv.config();

// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // CORS - Simple configuration
// // const allowedOrigins = [
// //   'https://kiosk-ai.vercel.app',
// //   'http://localhost:5000',
// //   'http://localhost:4001'
// // ];

// // app.use(cors({
// //   origin: allowedOrigins,
// //   credentials: true
// // }));

// // app.use(helmet());
// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// // app.use(morgan('combined'));

// // // Routes
// // app.get('/', (req, res) => {
// //   res.json({ 
// //     success: true, 
// //     message: 'Kiosk AI Backend API',
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // app.get('/health', (req, res) => {
// //   res.json({ 
// //     success: true, 
// //     status: 'healthy',
// //     uptime: process.uptime()
// //   });
// // });

// // // app.post('/api/v1/qr/generate', (req, res) => {
// // //   try {
// // //     const { data } = req.body;
    
// // //     if (!data) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         error: 'Data is required'
// // //       });
// // //     }
    
// // //     // Your QR generation logic here
// // //     const qrCode = {
// // //       id: Date.now().toString(),
// // //       data: data,
// // //       url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
// // //     };
    
// // //     res.status(200).json({
// // //       success: true,
// // //       data: qrCode
// // //     });
    
// // //   } catch (error: any) {
// // //     console.error('QR error:', error);
// // //     res.status(500).json({
// // //       success: false,
// // //       error: 'Internal server error'
// // //     });
// // //   }
// // // });

// // app.post('/api/v1/qr/generate', async (req, res) => {
// //   try {
// //     const { data } = req.body;
    
// //     if (!data) {
// //       return res.status(400).json({
// //         success: false,
// //         error: 'Data is required'
// //       });
// //     }
    
// //     // Generate unique code (same as ID)
// //     const code = Date.now().toString();
    
// //     // IMPORTANT: Point to your frontend upload page
// //     const uploadUrl = `https://kiosk-ai.vercel.app/upload?code=${code}`;
    
// //     // Generate QR code URL with the correct upload URL
// //     const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;
    
// //     // Save to database (if using DB)
// //     // await saveCodeToDatabase(code);
    
// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         id: code,
// //         code: code,  // Same as ID
// //         url: qrImageUrl,
// //         uploadUrl: uploadUrl  // Add this to response
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error('QR generation error:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Internal server error'
// //     });
// //   }
// // });
// // // Start server
// // app.listen(PORT, () => {
// //   console.log(`
// // 🚀 Server running on port ${PORT}
// // 🌍 Environment: ${process.env.NODE_ENV || 'development'}
// // 🔗 URL: http://localhost:${PORT}
// // 🔐 CORS allowed for: ${allowedOrigins.join(', ')}
// //   `);
// // });






// // import express from 'express';
// // import cors from 'cors';
// // import helmet from 'helmet';
// // import morgan from 'morgan';
// // import dotenv from 'dotenv';
// // import multer from 'multer';
// // import path from 'path';
// // import fs from 'fs';

// // dotenv.config();

// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // CORS - Simple configuration
// // const allowedOrigins = [
// //   'https://kiosk-ai.vercel.app',
// //   'http://localhost:3000',
// //   'http://localhost:5173'
// // ];

// // app.use(cors({
// //   origin: allowedOrigins,
// //   credentials: true
// // }));

// // app.use(helmet());
// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// // app.use(morgan('combined'));

// // // ========== MULTER CONFIGURATION ==========
// // // Ensure uploads directory exists
// // const uploadDir = path.join(process.cwd(), 'uploads');
// // if (!fs.existsSync(uploadDir)) {
// //   fs.mkdirSync(uploadDir, { recursive: true });
// // }

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, uploadDir);
// //   },
// //   filename: (req, file, cb) => {
// //     const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //     const ext = path.extname(file.originalname);
// //     cb(null, file.fieldname + '-' + uniqueId + ext);
// //   }
// // });

// // const upload = multer({
// //   storage: storage,
// //   limits: {
// //     fileSize: 10 * 1024 * 1024 // 10MB limit
// //   },
// //   fileFilter: (req, file, cb) => {
// //     const allowedTypes = /jpeg|jpg|png|gif|webp/;
// //     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
// //     const mimetype = allowedTypes.test(file.mimetype);
    
// //     if (mimetype && extname) {
// //       return cb(null, true);
// //     } else {
// //       cb(new Error('Only image files are allowed'));
// //     }
// //   }
// // });

// // // ========== ROUTES ==========
// // app.get('/', (req, res) => {
// //   res.json({ 
// //     success: true, 
// //     message: 'Kiosk AI Backend API',
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // app.get('/health', (req, res) => {
// //   res.json({ 
// //     success: true, 
// //     status: 'healthy',
// //     timestamp: new Date().toISOString(),
// //     uptime: process.uptime()
// //   });
// // });

// // // QR Generation
// // app.post('/api/v1/qr/generate', async (req, res) => {
// //   try {
// //     const { data = 'kiosk-upload' } = req.body; // Make data optional
    
// //     // Generate unique code
// //     const code = Date.now().toString();
    
// //     // IMPORTANT: Point to your frontend upload page
// //     const uploadUrl = `https://kiosk-ai.vercel.app/upload?code=${code}`;
    
// //     // Generate QR code URL
// //     const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;
    
// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         id: code,
// //         code: code,
// //         url: qrImageUrl,
// //         uploadUrl: uploadUrl
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error('QR generation error:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Internal server error'
// //     });
// //   }
// // });

// // // QR Validation - FIXED: Always return 200
// // app.get('/api/v1/qr/validate/:code', (req, res) => {
// //   try {
// //     const { code } = req.params;
    
// //     console.log(`🔍 Validating QR code: ${code}`);
    
// //     // For now, always return valid (you'll add DB check later)
// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         isValid: true,
// //         code: code,
// //         message: 'QR code is valid'
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error('QR validation error:', error);
// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         isValid: false,
// //         code: req.params.code,
// //         message: 'QR code check failed'
// //       }
// //     });
// //   }
// // });

// // // ========== UPLOAD ROUTES ==========
// // // Upload image
// // app.post('/api/v1/upload/upload', upload.single('image'), (req, res) => {
// //   try {
// //     const { code } = req.body;
    
// //     if (!code) {
// //       return res.status(400).json({
// //         success: false,
// //         error: 'Code is required'
// //       });
// //     }
    
// //     if (!req.file) {
// //       return res.status(400).json({
// //         success: false,
// //         error: 'No image file uploaded'
// //       });
// //     }

// //     console.log(`✅ Image uploaded for code: ${code}`);
// //     console.log(`📁 File: ${req.file.filename}, Size: ${req.file.size} bytes`);
    
// //     const imageUrl = `https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/${code}`;
    
// //     res.status(200).json({
// //       success: true,
// //       message: 'Image uploaded successfully',
// //       data: {
// //         code: code,
// //         imageUrl: imageUrl,
// //         fileName: req.file.originalname,
// //         fileSize: req.file.size,
// //         uploadedAt: new Date().toISOString()
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error('❌ Upload error:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Upload failed'
// //     });
// //   }
// // });

// // // Check upload status
// // app.get('/api/v1/upload/check/:code', (req, res) => {
// //   try {
// //     const { code } = req.params;
    
// //     console.log(`🔍 Checking upload for code: ${code}`);
    
// //     // For now, always return no image (you'll add DB check later)
// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         exists: false,
// //         code: code,
// //         message: 'No image uploaded for this code yet'
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error('❌ Check upload error:', error);
// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         exists: false,
// //         code: req.params.code,
// //         message: 'Check failed'
// //       }
// //     });
// //   }
// // });

// // // Get image
// // app.get('/api/v1/upload/image/:code', (req, res) => {
// //   try {
// //     const { code } = req.params;
    
// //     console.log(`📷 Getting image for code: ${code}`);
    
// //     // For now, return placeholder image
// //     res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Uploaded+Image');
    
// //   } catch (error) {
// //     console.error('❌ Get image error:', error);
// //     res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Error');
// //   }
// // });

// // // ========== START SERVER ==========
// // app.listen(PORT, () => {
// //   console.log(`
// // 🚀 Server running on port ${PORT}
// // 🌍 Environment: ${process.env.NODE_ENV || 'development'}
// // 🔗 URL: http://localhost:${PORT}
// // 📁 Uploads: http://localhost:${PORT}/api/v1/upload
// // 🔐 CORS allowed for: ${allowedOrigins.join(', ')}
// //   `);
// // });

// import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { MongoClient, Db } from 'mongodb';

// dotenv.config();

// const app = express();
// const PORT = parseInt(process.env.PORT || '5000', 10);

// // ========== DATABASE CONNECTION ==========
// let db: Db | null = null;
// const mongoUri = process.env.MONGODB_URI;

// async function connectDB() {
//   try {
//     if (!mongoUri) {
//       console.log('⚠️  MONGODB_URI not set, using in-memory storage');
//       return;
//     }
    
//     const client = new MongoClient(mongoUri);
//     await client.connect();
//     db = client.db('kiosk-ai');
//     console.log('✅ MongoDB connected');
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error);
//   }
// }

// connectDB();

// // ========== CORS CONFIGURATION ==========
// const allowedOrigins = [
//   'https://kiosk-ai.vercel.app',
//   'http://localhost:3000',
//   'http://localhost:5173'
// ];

// const corsOptions = {
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

// app.use(helmet());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(morgan('combined'));

// // ========== MULTER CONFIGURATION ==========
// const uploadDir = path.join(process.cwd(), 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req: Request, file: Express.Multer.File, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req: Request, file: Express.Multer.File, cb) => {
//     const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + '-' + uniqueId + ext);
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB
//   },
//   fileFilter: (req: Request, file: Express.Multer.File, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|webp/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
    
//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed'));
//     }
//   }
// });

// // ========== TYPE FOR IN-MEMORY STORAGE ==========
// interface UploadData {
//   code: string;
//   imageUrl: string;
//   fileName: string;
//   uploadedAt: Date;
// }

// declare global {
//   var uploads: Record<string, UploadData>;
// }

// // ========== ROUTES ==========
// app.get('/', (req: Request, res: Response) => {
//   res.json({ 
//     success: true, 
//     message: 'Kiosk AI Backend API',
//     timestamp: new Date().toISOString()
//   });
// });

// app.get('/health', (req: Request, res: Response) => {
//   res.json({ 
//     success: true, 
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });

// // QR Generation
// app.post('/api/v1/qr/generate', async (req: Request, res: Response) => {
//   try {
//     const { data = 'kiosk-upload' } = req.body;
    
//     const code = Date.now().toString();
//     const uploadUrl = `https://kiosk-ai.vercel.app/upload?code=${code}`;
//     const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;
    
//     console.log(`✅ QR generated for code: ${code}`);
    
//     // Save QR code to database if available
//     if (db) {
//       await db.collection('qrcodes').insertOne({
//         code,
//         uploadUrl,
//         qrImageUrl,
//         isActive: true,
//         createdAt: new Date(),
//         expiresAt: new Date(Date.now() + 30 * 60 * 1000)
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       data: {
//         id: code,
//         code: code,
//         url: qrImageUrl,
//         uploadUrl: uploadUrl
//       }
//     });
    
//   } catch (error: any) {
//     console.error('QR generation error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error'
//     });
//   }
// });

// // QR Validation
// app.get('/api/v1/qr/validate/:code', (req: Request, res: Response) => {
//   try {
//     const { code } = req.params;
    
//     console.log(`🔍 Validating QR code: ${code}`);
    
//     res.status(200).json({
//       success: true,
//       data: {
//         isValid: true,
//         code: code,
//         message: 'QR code is valid'
//       }
//     });
    
//   } catch (error: any) {
//     console.error('QR validation error:', error);
//     res.status(200).json({
//       success: true,
//       data: {
//         isValid: false,
//         code: req.params.code,
//         message: 'QR code check failed'
//       }
//     });
//   }
// });

// // ========== UPLOAD ROUTES ==========
// app.post('/api/v1/upload/upload', upload.single('image'), async (req: Request, res: Response) => {
//   try {
//     const { code } = req.body;
    
//     if (!code) {
//       return res.status(400).json({
//         success: false,
//         error: 'Code is required'
//       });
//     }
    
//     // TypeScript knows req.file is Express.Multer.File
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: 'No image file uploaded'
//       });
//     }

//     console.log(`✅ Image uploaded for code: ${code}`);
    
//     const imageUrl = `https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/${code}`;
    
//     // Save to database if available
//     if (db) {
//       await db.collection('uploads').insertOne({
//         code,
//         imageUrl,
//         fileName: req.file.originalname,
//         fileSize: req.file.size,
//         mimeType: req.file.mimetype,
//         filePath: req.file.path,
//         uploadedAt: new Date(),
//         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
//       });
//       console.log(`💾 Saved to database for code: ${code}`);
//     } else {
//       console.log(`⚠️  No database, storing in memory for code: ${code}`);
//       // Store in memory (temporary)
//       if (!global.uploads) {
//         global.uploads = {};
//       }
//       global.uploads[code] = {
//         code,
//         imageUrl,
//         fileName: req.file.originalname,
//         uploadedAt: new Date()
//       };
//     }
    
//     res.status(200).json({
//       success: true,
//       message: 'Image uploaded successfully',
//       data: {
//         code: code,
//         imageUrl: imageUrl,
//         fileName: req.file.originalname,
//         fileSize: req.file.size,
//         uploadedAt: new Date().toISOString()
//       }
//     });
    
//   } catch (error: any) {
//     console.error('❌ Upload error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Upload failed'
//     });
//   }
// });

// // Check upload status
// app.get('/api/v1/upload/check/:code', async (req: Request, res: Response) => {
//   try {
//     const { code } = req.params;
    
//     console.log(`🔍 Checking upload for code: ${code}`);
    
//     let exists = false;
//     let imageData: UploadData | null = null;
    
//     // Check database first
//     if (db) {
//       const upload = await db.collection('uploads').findOne({ code });
//       if (upload) {
//         exists = true;
//         imageData = {
//           code: upload.code,
//           imageUrl: upload.imageUrl,
//           fileName: upload.fileName,
//           uploadedAt: upload.uploadedAt
//         };
//       }
//     } 
//     // Check memory storage
//     else if (global.uploads && global.uploads[code]) {
//       exists = true;
//       imageData = global.uploads[code];
//     }
    
//     if (exists && imageData) {
//       res.status(200).json({
//         success: true,
//         data: {
//           exists: true,
//           code: code,
//           imageUrl: imageData.imageUrl,
//           fileName: imageData.fileName,
//           uploadedAt: imageData.uploadedAt,
//           message: 'Image found'
//         }
//       });
//     } else {
//       res.status(200).json({
//         success: true,
//         data: {
//           exists: false,
//           code: code,
//           message: 'No image uploaded for this code yet'
//         }
//       });
//     }
    
//   } catch (error: any) {
//     console.error('❌ Check upload error:', error);
//     res.status(200).json({
//       success: true,
//       data: {
//         exists: false,
//         code: req.params.code,
//         message: 'Check failed'
//       }
//     });
//   }
// });

// // // Get image
// // app.get('/api/v1/upload/image/:code', async (req: Request, res: Response) => {
// //   try {
// //     const { code } = req.params;
    
// //     console.log(`📷 Getting image for code: ${code}`);
    
// //     // Try to get file path from database
// //     let filePath: string | null = null;
// //     if (db) {
// //       const upload = await db.collection('uploads').findOne({ code });
// //       if (upload && upload.filePath) {
// //         filePath = upload.filePath;
// //       }
// //     }
    
// //     if (filePath && fs.existsSync(filePath)) {
// //       // Serve the actual uploaded file
// //       res.sendFile(path.resolve(filePath));
// //     } else {
// //       // Return placeholder
// //       res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Uploaded+Image');
// //     }
    
// //   } catch (error: any) {
// //     console.error('❌ Get image error:', error);
// //     res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Error');
// //   }
// // });

// // In your server.ts, update the getImage function:

// // Get image - FIXED to serve actual file
// app.get('/api/v1/upload/image/:code', async (req: Request, res: Response) => {
//   try {
//     const { code } = req.params;
    
//     console.log(`📷 Getting image for code: ${code}`);
    
//     // Default to placeholder
//     const placeholder = 'https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Uploaded+Image';
    
//     // Check memory storage first (no database)
//     if (global.uploads && global.uploads[code]) {
//       const upload = global.uploads[code];
      
//       // Try to find the uploaded file in uploads directory
//       const uploadDir = path.join(process.cwd(), 'uploads');
//       const files = fs.readdirSync(uploadDir);
      
//       // Find file by code or timestamp
//       const foundFile = files.find(file => {
//         // Files are named like: image-1768312345678-123456789.jpg
//         return file.includes(code) || file.includes(code.slice(-6));
//       });
      
//       if (foundFile) {
//         const filePath = path.join(uploadDir, foundFile);
//         if (fs.existsSync(filePath)) {
//           console.log(`✅ Serving actual image: ${foundFile}`);
          
//           // Determine content type
//           const ext = path.extname(foundFile).toLowerCase();
//           const mimeTypes: Record<string, string> = {
//             '.jpg': 'image/jpeg',
//             '.jpeg': 'image/jpeg',
//             '.png': 'image/png',
//             '.gif': 'image/gif',
//             '.webp': 'image/webp'
//           };
          
//           const contentType = mimeTypes[ext] || 'image/jpeg';
//           res.setHeader('Content-Type', contentType);
          
//           // Stream the file
//           const fileStream = fs.createReadStream(filePath);
//           fileStream.pipe(res);
          
//           fileStream.on('error', (err) => {
//             console.error('File stream error:', err);
//             res.redirect(placeholder);
//           });
          
//           return;
//         }
//       }
//     }
    
//     // If no file found, redirect to placeholder
//     console.log(`⚠️ No actual image found for code: ${code}, using placeholder`);
//     res.redirect(placeholder);
    
//   } catch (error: any) {
//     console.error('❌ Get image error:', error);
//     res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Error');
//   }
// });

// // ========== START SERVER ==========
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`
// 🚀 Server running on port ${PORT}
// 🌍 Environment: ${process.env.NODE_ENV || 'development'}
// 🔗 URL: http://localhost:${PORT}
// 🔗 Railway: https://kiosk-ai-be-production.up.railway.app
// 📊 Database: ${mongoUri ? 'MongoDB Connected' : 'In-memory storage'}
// 🔐 CORS allowed for: ${allowedOrigins.join(', ')}
//   `);
// });

// export default app;



import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 URL: http://localhost:${PORT}
🔗 Railway: https://kiosk-ai-be-production.up.railway.app
☁️ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured'}
📊 Database: ${process.env.MONGODB_URI ? 'MongoDB configured' : 'Using in-memory storage'}
  `);
  
  // Start cleanup
  console.log('🧹 File cleanup scheduled every 6 hours');
});