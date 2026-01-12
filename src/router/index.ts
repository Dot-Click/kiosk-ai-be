import { Router } from 'express';
import uploadRouter from './upload';
import qrRouter from './qr';

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

export default router;