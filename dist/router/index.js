"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("./upload"));
const qr_1 = __importDefault(require("./qr"));
const router = (0, express_1.Router)();
// API Routes
router.use('/upload', upload_1.default);
router.use('/qr', qr_1.default);
// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Kiosk AI Backend',
        version: '1.0.0'
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map