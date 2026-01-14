import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { corsOptions } from './config/cors';
import qrRoutes from './router/qr';
import uploadRoutes from './router/upload';
import { cleanupOldFiles } from './controllers/uploadController';

dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Connect to database
connectDB();

// Routes
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Home route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Kiosk AI Backend API',
    timestamp: new Date().toISOString(),
    endpoints: {
      qr: {
        generate: 'POST /api/v1/qr/generate',
        validate: 'GET /api/v1/qr/validate/:code',
        details: 'GET /api/v1/qr/details/:code'
      },
      upload: {
        upload: 'POST /api/v1/upload/upload',
        check: 'GET /api/v1/upload/check/:code',
        image: 'GET /api/v1/upload/image/:code'
      }
    }
  });
});

// Setup cleanup job every 6 hours
setInterval(cleanupOldFiles, 6 * 60 * 60 * 1000);

export default app;