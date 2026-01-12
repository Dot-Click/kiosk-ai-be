// src/router/qr.ts
import { Router } from 'express';
import qrController from '../controllers/qrController';

const router = Router();

// Routes
router.post('/generate', qrController.generateQR);
router.get('/validate/:code', qrController.validateQR);
router.get('/details/:code', qrController.getQRDetails);
router.put('/deactivate/:code', qrController.deactivateQR);

export default router;