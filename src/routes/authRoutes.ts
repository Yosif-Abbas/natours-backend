import express from 'express';
import {
  protect,
  refreshAccessToken,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/authController';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.post('/refresh-token', refreshAccessToken);

router.patch('/update-my-password', protect, updatePassword);

export default router;
