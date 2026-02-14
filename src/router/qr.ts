// // // src/router/qr.ts
// // import { Router } from 'express';
// // import qrController from '../controllers/qrController';

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


import { Router } from 'express';
import { generateQR, validateQR, getQRDetails } from '../controllers/qrController';

const router = Router();

/** @swagger
 * /v1/qr/generate:
 *   post:
 *     tags: [QR Code]
 *     summary: Generate QR code
 *     description: Generate a new QR code for kiosk upload flow.
 */
router.post('/generate', generateQR);

/** @swagger
 * /v1/qr/validate/{code}:
 *   get:
 *     tags: [QR Code]
 *     summary: Validate QR code
 *     parameters: [{ name: code, in: path, required: true, type: string }]
 */
router.get('/validate/:code', validateQR);

/** @swagger
 * /v1/qr/details/{code}:
 *   get:
 *     tags: [QR Code]
 *     summary: Get QR details
 *     parameters: [{ name: code, in: path, required: true, type: string }]
 */
router.get('/details/:code', getQRDetails);

export default router;