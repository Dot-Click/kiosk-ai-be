"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const cors_2 = require("./config/cors");
const qr_1 = __importDefault(require("./router/qr"));
const upload_1 = __importDefault(require("./router/upload"));
const uploadController_1 = require("./controllers/uploadController");
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
// Routes
app.use('/api/v1/qr', qr_1.default);
app.use('/api/v1/upload', upload_1.default);
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