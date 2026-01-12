"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/router/qr.ts
const express_1 = require("express");
const qrController_1 = __importDefault(require("../controllers/qrController"));
const router = (0, express_1.Router)();
// Routes
router.post('/generate', qrController_1.default.generateQR);
router.get('/validate/:code', qrController_1.default.validateQR);
router.get('/details/:code', qrController_1.default.getQRDetails);
router.put('/deactivate/:code', qrController_1.default.deactivateQR);
exports.default = router;
//# sourceMappingURL=qr.js.map