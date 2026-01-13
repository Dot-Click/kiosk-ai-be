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
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS - Simple configuration
const allowedOrigins = [
    'https://kiosk-ai.vercel.app',
    'http://localhost:5000',
    'http://localhost:4001'
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined'));
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
// app.post('/api/v1/qr/generate', (req, res) => {
//   try {
//     const { data } = req.body;
//     if (!data) {
//       return res.status(400).json({
//         success: false,
//         error: 'Data is required'
//       });
//     }
//     // Your QR generation logic here
//     const qrCode = {
//       id: Date.now().toString(),
//       data: data,
//       url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
//     };
//     res.status(200).json({
//       success: true,
//       data: qrCode
//     });
//   } catch (error: any) {
//     console.error('QR error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error'
//     });
//   }
// });
app.post('/api/v1/qr/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'Data is required'
            });
        }
        // Generate unique code (same as ID)
        const code = Date.now().toString();
        // IMPORTANT: Point to your frontend upload page
        const uploadUrl = `https://kiosk-ai.vercel.app/upload?code=${code}`;
        // Generate QR code URL with the correct upload URL
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uploadUrl)}`;
        // Save to database (if using DB)
        // await saveCodeToDatabase(code);
        res.status(200).json({
            success: true,
            data: {
                id: code,
                code: code, // Same as ID
                url: qrImageUrl,
                uploadUrl: uploadUrl // Add this to response
            }
        });
    }
    catch (error) {
        console.error('QR generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}));
// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 URL: http://localhost:${PORT}
🔐 CORS allowed for: ${allowedOrigins.join(', ')}
  `);
});
//# sourceMappingURL=server.js.map