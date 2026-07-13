import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as adminController from './controllers/admin.controller.js';

const router = Router();

// All routes require admin authorization
router.use(authenticate, authorize('admin'));

// Order management
router.get(
  '/admin/orders',
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  validate,
  adminController.getAllOrders
);

router.get(
  '/admin/orders/:id',
  param('id').isUUID().withMessage('Order ID must be a valid UUID'),
  validate,
  adminController.getOrderDetails
);

// Stats
router.get(
  '/admin/stats',
  adminController.getStats
);

export default router;
