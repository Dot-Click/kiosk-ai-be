import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';

const swaggerFile = fs.readFileSync(path.join(__dirname, '../swagger_output.json'), 'utf8');
const swaggerDocument = JSON.parse(swaggerFile);

// Read custom CSS and JS for Swagger
const customCss = fs.readFileSync(path.join(__dirname, 'swagger-custom.css'), 'utf8');
const customJs = fs.readFileSync(path.join(__dirname, 'swagger-custom.js'), 'utf8');
import { connectDB } from './config/db';
import { corsOptions } from './config/cors';
import qrRoutes from './router/qr';
import uploadRoutes from './router/upload';
import { cleanupOldFiles } from './controllers/uploadController';
import { imageCorsMiddleware } from './middleware/imageCors';
import productRoutes from "./router/product"

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

// Swagger Documentation with custom CSS and JS
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(
  swaggerDocument,
  {
    customCss: customCss,
    customJs: customJs,
    customSiteTitle: 'Time2Clean API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayOperationId: false,
      showExtensions: true,
      showCommonExtensions: true
    }
  }
));

// Routes
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/upload/image/:code', imageCorsMiddleware);
app.use("/api/products", productRoutes);


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
    documentation: '/api-docs',
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