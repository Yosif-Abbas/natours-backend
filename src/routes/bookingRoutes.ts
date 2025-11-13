import express from 'express';

import { getCheckoutSession } from '../controllers/bookingController';
import { protect } from '../controllers/authController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Booking management
 */

/**
 * @swagger
 * /bookings/checkout-session/{tourId}:
 *   get:
 *     summary: Get check-out session
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: Successfully retrieved a check-out session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the Stripe checkout session
 *                     url:
 *                       type: string
 *                       format: url
 *                       description: The URL to redirect to for the Stripe checkout
 *                   example:
 *                     id: "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2"
 *                     url: "https://checkout.stripe.com/c/pay/cs_test_..."
 *       404:
 *         description: User not found
 */

router.get('/checkout-session/:tourId', protect, getCheckoutSession);

export default router;
