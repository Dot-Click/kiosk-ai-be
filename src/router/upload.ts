    // // src/router/upload.ts
    // import { Router } from 'express';
    // import uploadController from '../controllers/uploadController';
    // import { uploadSingle } from '../config/multer';

    // const router = Router();

    // // Routes
    // router.post('/upload', uploadSingle('image'), uploadController.uploadImage);
    // router.get('/check/:code', uploadController.checkUpload);
    // router.get('/image/:code', uploadController.getImage);

    // export default router;


import { Router } from 'express';
import { uploadSingle } from '../config/multer';
import { imageCorsMiddleware } from '../middleware/imageCors';
import { uploadImage, checkUpload, getImage } from '../controllers/uploadController';

const router = Router();

/** @swagger
 * /v1/upload/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload image
 *     description: Upload image for a given QR code (multipart/form-data; field image).
 */
router.post('/upload', uploadSingle('image'), uploadImage);

/** @swagger
 * /v1/upload/check/{code}:
 *   get:
 *     tags: [Upload]
 *     summary: Check upload status
 *     parameters: [{ name: code, in: path, required: true, type: string }]
 */
router.get('/check/:code', checkUpload);

/** @swagger
 * /v1/upload/image/{code}:
 *   get:
 *     tags: [Upload]
 *     summary: Get uploaded image
 *     parameters: [{ name: code, in: path, required: true, type: string }]
 */
router.get('/image/:code', imageCorsMiddleware, getImage);

export default router;