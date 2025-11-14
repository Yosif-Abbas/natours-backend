import express from 'express';
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../api/user';

import { protect, restrictTo } from '../api/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

router.get('/id', getUser);

// Protect all routes after this.
router.use(protect);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the currently logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized – User not logged in
 */

router.get('/me', getMe, getUser);

/**
 * @swagger
 * /users/update-me:
 *   patch:
 *     summary: Update current user's information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully updated user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized – User not logged in
 */

router.patch('/update-me', uploadUserPhoto, resizeUserPhoto, updateMe);

/**
 * @swagger
 * /users/delete-me:
 *   delete:
 *     summary: Deactivate (soft delete) current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account successfully deactivated
 *       401:
 *         description: Unauthorized – User not logged in
 */

router.delete('/delete-me', deleteMe);

// restrict all routes after this.
router.use(restrictTo('admin'));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users - Only for admins
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden – Admins only
 *
 */

router.route('/').get(getAllUsers).post(createUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user by ID - Only for admins
 *     tags: [Users]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

router.patch('/id', updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID - Only for admins
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

router.delete('/id', deleteUser);

export default router;
