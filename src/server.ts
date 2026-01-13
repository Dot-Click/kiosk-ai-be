// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // CORS - Simple configuration
// const allowedOrigins = [
//   'https://kiosk-ai.vercel.app',
//   'http://localhost:5000',
//   'http://localhost:4001'
// ];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

// app.use(helmet());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(morgan('combined'));

// // Routes
// app.get('/', (req, res) => {
//   res.json({ 
//     success: true, 
//     message: 'Kiosk AI Backend API',
//     timestamp: new Date().toISOString()
//   });
// });

// app.get('/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     status: 'healthy',
//     uptime: process.uptime()
//   });
// });

// // app.post('/api/v1/qr/generate', (req, res) => {
// //   try {
// //     const { data } = req.body;
    
// //     if (!data) {
// //       return res.status(400).json({
// //         success: false,
// //         error: 'Data is required'
// //       });
// //     }
    
// //     // Your QR generation logic here
// //     const qrCode = {
// //       id: Date.now().toString(),
// //       data: data,
// //       url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
// //     };
    
// //     res.status(200).json({
// //       success: true,
// //       data: qrCode
// //     });
    
// //   } catch (error: any) {
// //     console.error('QR error:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: 'Internal server error'
// //     });
// //   }
// // });

// app.post('/api/v1/qr/generate', async (req, res) => {
//   try {
//     const { data } = req.body;
    
//     if (!data) {
//       return res.status(400).json({
//         success: false,
//         error: 'Data is required'
//       });
//     }
    
//     // Generate unique code (same as ID)
//     const code = Date.now().toString();
    
//     // IMPORTANT: Point to your frontend upload page
//     const uploadUrl = `https://kiosk-ai.vercel.app/upload?code=${code}`;
    
//     // Generate QR code URL with the correct upload URL
//     const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;
    
//     // Save to database (if using DB)
//     // await saveCodeToDatabase(code);
    
//     res.status(200).json({
//       success: true,
//       data: {
//         id: code,
//         code: code,  // Same as ID
//         url: qrImageUrl,
//         uploadUrl: uploadUrl  // Add this to response
//       }
//     });
    
//   } catch (error) {
//     console.error('QR generation error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error'
//     });
//   }
// });
// // Start server
// app.listen(PORT, () => {
//   console.log(`
// 🚀 Server running on port ${PORT}
// 🌍 Environment: ${process.env.NODE_ENV || 'development'}
// 🔗 URL: http://localhost:${PORT}
// 🔐 CORS allowed for: ${allowedOrigins.join(', ')}
//   `);
// });






import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Simple configuration
const allowedOrigins = [
  'https://kiosk-ai.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// ========== MULTER CONFIGURATION ==========
// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueId + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
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

// ========== ROUTES ==========
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Kiosk AI Backend API',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// QR Generation
app.post('/api/v1/qr/generate', async (req, res) => {
  try {
    const { data = 'kiosk-upload' } = req.body; // Make data optional
    
    // Generate unique code
    const code = Date.now().toString();
    
    // IMPORTANT: Point to your frontend upload page
    const uploadUrl = `https://kiosk-ai.vercel.app/upload?code=${code}`;
    
    // Generate QR code URL
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;
    
    res.status(200).json({
      success: true,
      data: {
        id: code,
        code: code,
        url: qrImageUrl,
        uploadUrl: uploadUrl
      }
    });
    
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// QR Validation - FIXED: Always return 200
app.get('/api/v1/qr/validate/:code', (req, res) => {
  try {
    const { code } = req.params;
    
    console.log(`🔍 Validating QR code: ${code}`);
    
    // For now, always return valid (you'll add DB check later)
    res.status(200).json({
      success: true,
      data: {
        isValid: true,
        code: code,
        message: 'QR code is valid'
      }
    });
    
  } catch (error) {
    console.error('QR validation error:', error);
    res.status(200).json({
      success: true,
      data: {
        isValid: false,
        code: req.params.code,
        message: 'QR code check failed'
      }
    });
  }
});

// ========== UPLOAD ROUTES ==========
// Upload image
app.post('/api/v1/upload/upload', upload.single('image'), (req, res) => {
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
    console.log(`📁 File: ${req.file.filename}, Size: ${req.file.size} bytes`);
    
    const imageUrl = `https://kiosk-ai-be-production.up.railway.app/api/v1/upload/image/${code}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        code: code,
        imageUrl: imageUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        uploadedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

// Check upload status
app.get('/api/v1/upload/check/:code', (req, res) => {
  try {
    const { code } = req.params;
    
    console.log(`🔍 Checking upload for code: ${code}`);
    
    // For now, always return no image (you'll add DB check later)
    res.status(200).json({
      success: true,
      data: {
        exists: false,
        code: code,
        message: 'No image uploaded for this code yet'
      }
    });
    
  } catch (error) {
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
});

// Get image
app.get('/api/v1/upload/image/:code', (req, res) => {
  try {
    const { code } = req.params;
    
    console.log(`📷 Getting image for code: ${code}`);
    
    // For now, return placeholder image
    res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Uploaded+Image');
    
  } catch (error) {
    console.error('❌ Get image error:', error);
    res.redirect('https://via.placeholder.com/400x300/2d2d6d/ffffff?text=Error');
  }
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 URL: http://localhost:${PORT}
📁 Uploads: http://localhost:${PORT}/api/v1/upload
🔐 CORS allowed for: ${allowedOrigins.join(', ')}
  `);
});