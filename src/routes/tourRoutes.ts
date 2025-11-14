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
} from '../api/tour';
import { protect, restrictTo } from '../api/auth';
// import { cacheMiddleware, cacheResponse, clearCacheMiddleware } from '../middleware/cache';
import reviewRouter from './reviewRoutes';

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

/**
 * @swagger
 * tags:
 *   name: Tours
 *   description: Tour management and operations
 */

/**
 * @swagger
 * /tours/top-5-cheap:
 *   get:
 *     summary: Get top 5 cheapest tours
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: List of top 5 cheap tours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 *       404:
 *         description: Not found
 */

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

/**
 * @swagger
 * /tours/tour-stats:
 *   get:
 *     summary: Get tour statistics
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: List of tour statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     enum: ['EASY', 'MEDIUM', 'DIFFICULT']
 *                     example: "DIFFICULT"
 *                   numTours:
 *                     type: number
 *                     example: 1
 *                   numRatings:
 *                     type: number
 *                     example: 6
 *                   avgRating:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     example: 4.5
 *                   avgPrice:
 *                     type: number
 *                     example: 997
 *                   minPrice:
 *                     type: number
 *                     example: 997
 *                   maxPrice:
 *                     type: number
 *                     example: 997
 *       404:
 *         description: Not found
 */

router.route('/tour-stats').get(getTourStats);

/**
 * @swagger
 * /tours/monthly-plan/{year}:
 *   get:
 *     summary: Get monthly plan for a given year
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2021
 *     responses:
 *       200:
 *         description: Monthly plan data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   numTourStarts:
 *                     type: number
 *                     example: 3
 *                   tours:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "The Sea Explorer"
 *                     example:
 *                       - "The Sea Explorer"
 *                       - "The Forest Hiker"
 *                       - "The Sports Lover"
 *                   month:
 *                     type: number
 *                     example: 7
 */

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

/**
 * @swagger
 * /tours/tours-within/{distance}/center/{latlng}/unit/{unit}:
 *   get:
 *     summary: Find tours within a certain distance
 *     tags: [Tours]
 *     parameters:
 *       - name: distance
 *         in: path
 *         required: true
 *         schema: { type: number }
 *       - name: latlng
 *         in: path
 *         required: true
 *         description: Latitude and longitude, comma separated
 *         schema: { type: string }
 *       - name: unit
 *         in: path
 *         required: true
 *         schema: { type: string, enum: [mi, km] }
 *     responses:
 *       200:
 *         description: List of nearby tours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 */

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getTourWithin);

/**
 * @swagger
 * /tours/distances/{latlng}/unit/{unit}:
 *   get:
 *     summary: Get distances from a point to all tours
 *     tags: [Tours]
 *     parameters:
 *       - name: latlng
 *         in: path
 *         required: true
 *         description: Latitude and longitude, comma separated
 *         schema: { type: string }
 *       - name: unit
 *         in: path
 *         required: true
 *         schema: { type: string, enum: [mi, km] }
 *     responses:
 *       200:
 *         description: List of distances
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 */

router.route('/distances/:latlng/unit/:unit').get(getDistances);

/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Get all tours
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: List of all tours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 *
 *   post:
 *     summary: Create a new tour
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *             properties:
 *               name:
 *                 type: string
 *                 example: The Forest Hiker
 *               price:
 *                 type: number
 *                 example: 497
 *               duration:
 *                 type: number
 *                 example: 5
 *     responses:
 *       201:
 *         description: Tour created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 */

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, createTour);

/**
 * @swagger
 * /tours/{id}:
 *   get:
 *     summary: Get a single tour by ID
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: A single tour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *
 *   patch:
 *     summary: Update an existing tour
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               price: 499
 *               difficulty: medium
 *     responses:
 *       200:
 *         description: Tour updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *   delete:
 *     summary: Delete a tour
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tour deleted successfully
 */

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
