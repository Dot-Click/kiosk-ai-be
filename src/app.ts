import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http'; // Add this import
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Config
dotenv.config();

// Import modules
import connectDB from './config/db';
import router from './router';
import { logger } from './functions/logger';
import { ErrorHandler } from './utils/ErrorHandler';
import { ApiError } from './utils/ApiError';

class App {
  public app: Application;
  public server: http.Server; // Add server property

  constructor() {
    this.app = express();
    this.config();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.connectDatabase();
    this.ensureDirectories();
  }

  private config(): void {
    this.app.set('port', process.env.PORT || 5000);
    this.app.set('trust proxy', 1); // Trust first proxy
  }

  private async connectDatabase(): Promise<void> {
    try {
      await connectDB();
      logger.info('✅ Database connection established');
    } catch (error: any) {
      logger.error(`❌ Database connection failed: ${error.message}`);
      // Don't exit in production, let the server run without DB
      if (process.env.NODE_ENV === 'production') {
        logger.warn('Running in production without database connection');
      } else {
        process.exit(1);
      }
    }
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    
    // CORS
    const corsOptions = {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL!, 'kiosk-ai.vercel.app']
        : ['http://kiosk-ai.vercel.app', 'http://kiosk-ai.vercel.app', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Disposition']
    };
    
    this.app.use(cors(corsOptions));
    this.app.options('*', cors(corsOptions)); // Pre-flight requests

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Serve static files
    const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads/images');
    this.app.use('/uploads/images', express.static(uploadsDir, {
      setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      }
    }));
  }

  private ensureDirectories(): void {
    const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads/images');
    const logsDir = path.join(__dirname, '..', 'logs');
    
    [uploadsDir, logsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    });
  }

  private initializeRoutes(): void {
    // Root route - API Documentation
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: '🚀 Kiosk AI Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        documentation: {
          baseUrl: process.env.API_URL || 'http://nodejs-production-25045463.up.railway.app',
          endpoints: {
            health: 'GET /api/v1/health',
            generateQR: 'POST /api/v1/qr/generate',
            validateQR: 'GET /api/v1/qr/validate/:code',
            checkUpload: 'GET /api/v1/upload/check/:code',
            uploadImage: 'POST /api/v1/upload/upload',
            getImage: 'GET /api/v1/upload/image/:code',
            getStats: 'GET /api/v1/upload/stats',
            qrStats: 'GET /api/v1/qr/stats'
          }
        },
        status: 'operational',
        uptime: process.uptime()
      });
    });

    // API Routes
    this.app.use('/api/v1', router);

    // API Documentation route
    this.app.get('/api-docs', (req: Request, res: Response) => {
      res.redirect('https://documenter.getpostman.com/view/your-doc-id'); // Add your Postman/API docs link
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      throw new ApiError(404, `Route ${req.originalUrl} not found`);
    });

    // Global error handler
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      ErrorHandler.handleError(err, req, res);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      this.shutdown();
    });
    
    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      this.shutdown();
    });
  }

  private shutdown(): void {
    if (this.server) {
      this.server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }

  public start(): void {
    const port = this.app.get('port');
    
    // Create HTTP server
    this.server = http.createServer(this.app);
    
    this.server.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Base URL: ${process.env.API_URL || `http://localhost:${port}`}`);
      logger.info(`📁 Uploads: ${process.env.API_URL || `http://localhost:${port}`}/uploads/images`);
      logger.info(`📊 Health: ${process.env.API_URL || `http://localhost:${port}`}/api/v1/health`);
      logger.info(`🔐 CORS Origin: ${process.env.FRONTEND_URL || 'http://kiosk-ai.vercel.app'}`);
    });

    // Handle server errors
    this.server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
        process.exit(1);
      } else {
        logger.error(`Server error: ${error.message}`);
      }
    });
  }
}

export default App;