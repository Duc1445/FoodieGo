import { Router } from 'express';
import { param, body, query } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// All routes require admin authorization
router.use(authenticate, authorize('admin'));

// User management
router.get(
  '/users',
  query('role')
    .optional()
    .isIn(['customer', 'merchant', 'driver', 'admin'])
    .withMessage('Invalid role'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  validate,
  adminController.getAllUsers,
);

router.delete(
  '/users/:id',
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
  validate,
  adminController.deleteUser,
);

// Approval management
router.get(
  '/users/pending',
  query('role').optional().isIn(['merchant', 'driver']).withMessage('Invalid role for pending'),
  validate,
  adminController.getPendingUsers,
);

router.patch(
  '/users/:id/approve',
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
  validate,
  adminController.approveUser,
);

router.patch(
  '/users/:id/reject',
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
  body('reason').notEmpty().withMessage('Rejection reason is required'),
  validate,
  adminController.rejectUser,
);

// Dashboard stats (aggregated by gateway)
router.get('/stats', adminController.getStats);

export default router;
