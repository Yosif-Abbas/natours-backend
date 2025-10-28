import express from 'express';
import {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} from '../controllers/tourController';
import { protect, restrictTo } from '../controllers/authController';
// import { cacheMiddleware, cacheResponse, clearCacheMiddleware } from '../middleware/cache';
import reviewRouter from './reviewRoutes';

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getTourWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.route('/').get(getAllTours).post(
  protect,
  restrictTo('admin', 'lead-guide'),

  uploadTourImages,
  resizeTourImages,
  createTour,
);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
