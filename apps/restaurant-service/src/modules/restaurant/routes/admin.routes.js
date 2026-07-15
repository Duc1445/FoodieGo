import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// All routes require admin authorization
const adminAuth = [authenticate, authorize('admin')];

// Restaurant management
router.get(
  '/admin/restaurants',
  adminAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  validate,
  adminController.getAllRestaurants,
);

router.get('/admin/restaurants/stats', adminAuth, adminController.getStats);

router.get('/admin/restaurants/pending', adminAuth, adminController.getPendingRestaurants);

router.patch(
  '/admin/restaurants/:id/approve',
  adminAuth,
  param('id').isUUID().withMessage('Restaurant ID must be a valid UUID'),
  validate,
  adminController.approveRestaurant,
);

router.patch(
  '/admin/restaurants/:id/reject',
  adminAuth,
  param('id').isUUID().withMessage('Restaurant ID must be a valid UUID'),
  validate,
  adminController.rejectRestaurant,
);

router.patch(
  '/admin/restaurants/:id/status',
  adminAuth,
  param('id').isUUID().withMessage('Restaurant ID must be a valid UUID'),
  validate,
  adminController.toggleRestaurantStatus,
);

export default router;
