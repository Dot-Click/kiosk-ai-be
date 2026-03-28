import { Router } from 'express';
import uploadRouter from './upload';
import qrRouter from './qr';
import * as adminController from '../controllers/adminController';

const router = Router();

// API Routes
router.use('/upload', uploadRouter);
router.use('/qr', qrRouter);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Kiosk AI Backend',
    version: '1.0.0'
  });
});


// Public order tracking route
router.get('/track/:orderNumber', adminController.trackOrder);

export default router;