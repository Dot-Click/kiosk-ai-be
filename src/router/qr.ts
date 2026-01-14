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

router.post('/generate', generateQR);
router.get('/validate/:code', validateQR);
router.get('/details/:code', getQRDetails);

export default router;