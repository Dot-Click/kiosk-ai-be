"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/router/upload.ts
const express_1 = require("express");
const uploadController_1 = __importDefault(require("../controllers/uploadController"));
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// Routes
router.post('/upload', (0, multer_1.uploadSingle)('image'), uploadController_1.default.uploadImage);
router.get('/check/:code', uploadController_1.default.checkUpload);
router.get('/image/:code', uploadController_1.default.getImage);
exports.default = router;
//# sourceMappingURL=upload.js.map