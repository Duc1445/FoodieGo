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
  query('role').optional().isIn(['customer', 'merchant', 'shipper', 'admin']).withMessage('Invalid role'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  validate,
  adminController.getAllUsers
);

router.patch(
  '/users/:id/role',
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
  body('role').isIn(['customer', 'merchant', 'shipper', 'admin']).withMessage('Invalid role'),
  validate,
  adminController.updateUserRole
);

router.delete(
  '/users/:id',
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
  validate,
  adminController.deleteUser
);

// Merchant management
router.get('/merchants/pending', adminController.getPendingMerchants);

router.patch(
  '/merchants/:id/approve',
  param('id').isUUID().withMessage('Merchant ID must be a valid UUID'),
  validate,
  adminController.approveMerchant
);

router.patch(
  '/merchants/:id/reject',
  param('id').isUUID().withMessage('Merchant ID must be a valid UUID'),
  body('reason').notEmpty().withMessage('Rejection reason is required'),
  validate,
  adminController.rejectMerchant
);

export default router;
