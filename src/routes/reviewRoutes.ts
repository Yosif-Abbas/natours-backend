import express from 'express';
import {
  getAllReview,
  createReview,
  checkTourUserIds,
  getReview,
  updateReview,
  deleteReview,
  checkUser,
} from '../controllers/reviewController';
import { protect, restrictTo } from '../controllers/authController';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReview)
  .post(restrictTo('user', 'admin'), checkTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(checkUser, restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

export default router;
