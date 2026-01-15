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

router.post('/upload', uploadSingle('image'), uploadImage);
router.get('/check/:code', checkUpload);
router.get('/image/:code', imageCorsMiddleware, getImage);

export default router;