import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import * as checkoutController from '../controllers/checkout.controller.js';

const router = Router();

router.post(
  '/',
  authenticate,
  body('note').optional().isString(),
  body('address').optional().isString(),
  body('order_type').optional().isIn(['dine-in', 'takeaway']),
  validate,
  checkoutController.createOrder
);

router.get('/', authenticate, checkoutController.getMyOrders);

router.get('/all', authenticate, authorize('admin'), checkoutController.getAllOrders);

router.get(
  '/:id',
  authenticate,
  param('id').isUUID().withMessage('id must be a valid UUID'),
  validate,
  checkoutController.getOrderById
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'shipper'),
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'])
    .withMessage('Invalid order status'),
  validate,
  checkoutController.updateOrderStatus
);

export default router;
