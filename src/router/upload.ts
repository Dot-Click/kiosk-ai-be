// src/router/upload.ts
import { Router } from 'express';
import uploadController from '../controllers/uploadController';
import { uploadSingle } from '../config/multer';

const router = Router();

// Routes
router.post('/upload', uploadSingle('image'), uploadController.uploadImage);
router.get('/check/:code', uploadController.checkUpload);
router.get('/image/:code', uploadController.getImage);

export default router;