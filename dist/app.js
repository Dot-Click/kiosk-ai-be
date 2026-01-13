"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http")); // Add this import
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
// Config
dotenv_1.default.config();
// Import modules
const db_1 = __importDefault(require("./config/db"));
const router_1 = __importDefault(require("./router"));
const logger_1 = require("./functions/logger");
const ErrorHandler_1 = require("./utils/ErrorHandler");
const ApiError_1 = require("./utils/ApiError");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.connectDatabase();
        this.ensureDirectories();
    }
    config() {
        this.app.set('port', process.env.PORT || 5000);
        this.app.set('trust proxy', 1); // Trust first proxy
    }
    connectDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, db_1.default)();
                logger_1.logger.info('✅ Database connection established');
            }
            catch (error) {
                logger_1.logger.error(`❌ Database connection failed: ${error.message}`);
                // Don't exit in production, let the server run without DB
                if (process.env.NODE_ENV === 'production') {
                    logger_1.logger.warn('Running in production without database connection');
                }
                else {
                    process.exit(1);
                }
            }
        });
    }
    initializeMiddlewares() {
        // Security
        this.app.use((0, helmet_1.default)({
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
                ? [process.env.FRONTEND_URL, 'kiosk-ai.vercel.app']
                : ['https://kiosk-ai.vercel.app', 'https://kiosk-ai.vercel.app', 'https://localhost:5173'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            exposedHeaders: ['Content-Disposition']
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.options('*', (0, cors_1.default)(corsOptions)); // Pre-flight requests
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Logging
        this.app.use((0, morgan_1.default)('combined', {
            stream: {
                write: (message) => logger_1.logger.info(message.trim())
            }
        }));
        // Serve static files
        const uploadsDir = path_1.default.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads/images');
        this.app.use('/uploads/images', express_1.default.static(uploadsDir, {
            setHeaders: (res, filePath) => {
                res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            }
        }));
    }
    ensureDirectories() {
        const uploadsDir = path_1.default.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads/images');
        const logsDir = path_1.default.join(__dirname, '..', 'logs');
        [uploadsDir, logsDir].forEach(dir => {
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
                logger_1.logger.info(`Created directory: ${dir}`);
            }
        });
    }
    initializeRoutes() {
        // Root route - API Documentation
        this.app.get('/', (req, res) => {
            res.status(200).json({
                success: true,
                message: '🚀 Kiosk AI Backend API',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                documentation: {
                    baseUrl: process.env.API_URL || 'https://kiosk-ai-be-production.up.railway.app',
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
        this.app.use('/api/v1', router_1.default);
        // API Documentation route
        this.app.get('/api-docs', (req, res) => {
            res.redirect('https://documenter.getpostman.com/view/your-doc-id'); // Add your Postman/API docs link
        });
    }
    initializeErrorHandling() {
        // 404 handler
        this.app.use('*', (req, res) => {
            throw new ApiError_1.ApiError(404, `Route ${req.originalUrl} not found`);
        });
        // Global error handler
        this.app.use((err, req, res, next) => {
            ErrorHandler_1.ErrorHandler.handleError(err, req, res);
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger_1.logger.info('SIGTERM received. Shutting down gracefully...');
            this.shutdown();
        });
        process.on('SIGINT', () => {
            logger_1.logger.info('SIGINT received. Shutting down gracefully...');
            this.shutdown();
        });
    }
    shutdown() {
        if (this.server) {
            this.server.close(() => {
                logger_1.logger.info('Server closed');
                process.exit(0);
            });
        }
        else {
            process.exit(0);
        }
    }
    start() {
        const port = this.app.get('port');
        // Create HTTP server
        this.server = http_1.default.createServer(this.app);
        this.server.listen(port, () => {
            logger_1.logger.info(`🚀 Server running on port ${port}`);
            logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger_1.logger.info(`🔗 Base URL: ${process.env.API_URL || `https://localhost:${port}`}`);
            logger_1.logger.info(`📁 Uploads: ${process.env.API_URL || `https://localhost:${port}`}/uploads/images`);
            logger_1.logger.info(`📊 Health: ${process.env.API_URL || `https://localhost:${port}`}/api/v1/health`);
            logger_1.logger.info(`🔐 CORS Origin: ${process.env.FRONTEND_URL || 'https://kiosk-ai.vercel.app'}`);
        });
        // Handle server errors
        this.server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger_1.logger.error(`Port ${port} is already in use`);
                process.exit(1);
            }
            else {
                logger_1.logger.error(`Server error: ${error.message}`);
            }
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map