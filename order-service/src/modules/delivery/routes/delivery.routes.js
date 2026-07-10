import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import * as deliveryController from '../controllers/delivery.controller.js';

const router = Router();

router.get(
  '/order/:orderId',
  authenticate,
  param('orderId').isUUID().withMessage('orderId must be a valid UUID'),
  validate,
  deliveryController.getDeliveryByOrder
);

router.patch(
  '/:id/accept',
  authenticate,
  authorize('shipper'),
  param('id').isUUID().withMessage('id must be a valid UUID'),
  validate,
  deliveryController.acceptDelivery
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('shipper'),
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('status')
    .isIn(['waiting', 'accepted', 'delivering', 'delivered'])
    .withMessage('Invalid delivery status'),
  validate,
  deliveryController.updateDeliveryStatus
);

export default router;
