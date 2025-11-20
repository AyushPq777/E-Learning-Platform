import express from 'express';
import {
    createPaymentIntent,
    confirmEnrollment,
    handleWebhook,
    getPaymentHistory
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Webhook route (must be before body parser middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-enrollment', confirmEnrollment);
router.get('/history', getPaymentHistory);

export default router;