import express from 'express';
import {
  clickPrepare,
  clickComplete,
  paymeWebhook,
  getClickPaymentUrl,
  getPaymePaymentUrl,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/click/prepare', clickPrepare);
router.post('/click/complete', clickComplete);
router.post('/payme', paymeWebhook);

router.get('/click/url/:orderId', protect, getClickPaymentUrl);
router.get('/payme/url/:orderId', protect, getPaymePaymentUrl);

export default router;
