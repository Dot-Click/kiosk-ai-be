"use strict";
// // src/router/upload.ts
// import { Router } from 'express';
// import uploadController from '../controllers/uploadController';
// import { uploadSingle } from '../config/multer';
Object.defineProperty(exports, "__esModule", { value: true });
// const router = Router();
// // Routes
// router.post('/upload', uploadSingle('image'), uploadController.uploadImage);
// router.get('/check/:code', uploadController.checkUpload);
// router.get('/image/:code', uploadController.getImage);
// export default router;
const express_1 = require("express");
const multer_1 = require("../config/multer");
const imageCors_1 = require("../middleware/imageCors");
const uploadController_1 = require("../controllers/uploadController");
const router = (0, express_1.Router)();
/** @swagger
 * /v1/upload/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload image
 *     description: Upload image for a given QR code (multipart/form-data; field image).
 */
router.post('/upload', (0, multer_1.uploadSingle)('image'), uploadController_1.uploadImage);
/** @swagger
 * /v1/upload/check/{code}:
 *   get:
 *     tags: [Upload]
 *     summary: Check upload status
 *     parameters: [{ name: code, in: path, required: true, type: string }]
 */
router.get('/check/:code', uploadController_1.checkUpload);
/** @swagger
 * /v1/upload/image/{code}:
 *   get:
 *     tags: [Upload]
 *     summary: Get uploaded image
 *     parameters: [{ name: code, in: path, required: true, type: string }]
 */
router.get('/image/:code', imageCors_1.imageCorsMiddleware, uploadController_1.getImage);
exports.default = router;
//# sourceMappingURL=upload.js.map