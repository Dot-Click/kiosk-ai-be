import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Simple configuration
const allowedOrigins = [
  'https://kiosk-ai.vercel.app',
  'http://localhost:5000',
  'http://localhost:4001'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Routes
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
    uptime: process.uptime()
  });
});

app.post('/api/v1/qr/generate', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required'
      });
    }
    
    // Your QR generation logic here
    const qrCode = {
      id: Date.now().toString(),
      data: data,
      url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
    };
    
    res.status(200).json({
      success: true,
      data: qrCode
    });
    
  } catch (error: any) {
    console.error('QR error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 URL: http://localhost:${PORT}
🔐 CORS allowed for: ${allowedOrigins.join(', ')}
  `);
});