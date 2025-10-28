import express from 'express';

import { getCheckoutSession } from '../controllers/bookingController';
import { protect } from '../controllers/authController';

const router = express.Router();

router.get('/checkout-session/:tourId', protect, getCheckoutSession);

export default router;
