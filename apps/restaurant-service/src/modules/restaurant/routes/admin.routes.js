import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// All routes require admin authorization
router.use(authenticate, authorize('admin'));

// Restaurant management
router.get(
  '/admin/restaurants',
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  validate,
  adminController.getAllRestaurants
);

router.patch(
  '/admin/restaurants/:id/status',
  param('id').isUUID().withMessage('Restaurant ID must be a valid UUID'),
  validate,
  adminController.toggleRestaurantStatus
);

export default router;
