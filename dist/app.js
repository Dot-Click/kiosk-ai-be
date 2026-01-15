"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const swaggerFile = fs.readFileSync(path.join(__dirname, '../swagger_output.json'), 'utf8');
const swaggerDocument = JSON.parse(swaggerFile);
// Read custom CSS and JS for Swagger
const customCss = fs.readFileSync(path.join(__dirname, 'swagger-custom.css'), 'utf8');
const customJs = fs.readFileSync(path.join(__dirname, 'swagger-custom.js'), 'utf8');
const db_1 = require("./config/db");
const cors_2 = require("./config/cors");
const qr_1 = __importDefault(require("./router/qr"));
const upload_1 = __importDefault(require("./router/upload"));
const uploadController_1 = require("./controllers/uploadController");
const imageCors_1 = require("./middleware/imageCors");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
// Middleware
app.use((0, cors_1.default)(cors_2.corsOptions));
app.options('*', (0, cors_1.default)(cors_2.corsOptions));
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined'));
// Connect to database
(0, db_1.connectDB)();
// Swagger Documentation with custom CSS and JS
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
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
}));
// Routes
app.use('/api/v1/qr', qr_1.default);
app.use('/api/v1/upload', upload_1.default);
app.use('/api/v1/upload/image/:code', imageCors_1.imageCorsMiddleware);
// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Home route
app.get('/', (req, res) => {
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
setInterval(uploadController_1.cleanupOldFiles, 6 * 60 * 60 * 1000);
exports.default = app;
//# sourceMappingURL=app.js.map