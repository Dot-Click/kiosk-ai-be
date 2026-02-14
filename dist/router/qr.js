"use strict";
// // // src/router/qr.ts
// // import { Router } from 'express';
// // import qrController from '../controllers/qrController';
Object.defineProperty(exports, "__esModule", { value: true });
// // const router = Router();
// // // Routes
// // router.post('/generate', qrController.generateQR);
// // router.get('/validate/:code', qrController.validateQR);
// // router.get('/details/:code', qrController.getQRDetails);
// // router.put('/deactivate/:code', qrController.deactivateQR);
// // export default router;
// import { Router } from 'express';
// import qrController from '../controllers/qrController';
// const router = Router();
// // Routes
// router.post('/generate', qrController.generateQR);
// router.get('/validate/:code', qrController.validateQR); // This should exist
// router.get('/details/:code', qrController.getQRDetails);
// router.put('/deactivate/:code', qrController.deactivateQR);
// export default router;
const express_1 = require("express");
const qrController_1 = require("../controllers/qrController");
const router = (0, express_1.Router)();
/** @swagger
 * /v1/qr/generate:
 *   post:
 *     tags: [QR Code]
 *     summary: Generate QR code
 *     description: Generate a new QR code for kiosk upload flow.
 */
router.post('/generate', qrController_1.generateQR);
/** @swagger
 * /v1/qr/validate/{code}:
 *   get:
 *     tags: [QR Code]
 *     summary: Validate QR code
 *     parameters: [{ name: code, in: path, required: true, type: string }]
 */
router.get('/validate/:code', qrController_1.validateQR);
/** @swagger
 * /v1/qr/details/{code}:
 *   get:
 *     tags: [QR Code]
 *     summary: Get QR details
 *     parameters: [{ name: code, in: path, required: true, type: string }]
 */
router.get('/details/:code', qrController_1.getQRDetails);
exports.default = router;
//# sourceMappingURL=qr.js.map