import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as DeliveryModel from './delivery.model.js';
import * as OrderModel from '../checkout/order.model.js';

const router = Router();

// ─── GET /api/delivery/order/:orderId — get delivery by order ───────────────
router.get(
  '/order/:orderId',
  authenticate,
  param('orderId').isUUID().withMessage('orderId must be a valid UUID'),
  validate,
  async (req, res, next) => {
    try {
      const delivery = await DeliveryModel.findByOrderId(req.params.orderId);
      if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
      res.json({ success: true, data: delivery });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /api/delivery/:id/accept — shipper accepts delivery ──────────────
router.patch(
  '/:id/accept',
  authenticate,
  authorize('shipper'),
  param('id').isUUID().withMessage('id must be a valid UUID'),
  validate,
  async (req, res, next) => {
    try {
      const delivery = await DeliveryModel.assignShipper(req.params.id, req.user.id);
      if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
      res.json({ success: true, message: 'Delivery accepted', data: delivery });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /api/delivery/:id/status — shipper updates delivery status ───────
router.patch(
  '/:id/status',
  authenticate,
  authorize('shipper'),
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('status')
    .isIn(['waiting', 'accepted', 'delivering', 'delivered'])
    .withMessage('Invalid delivery status'),
  validate,
  async (req, res, next) => {
    try {
      const delivery = await DeliveryModel.updateStatus(req.params.id, req.body.status);
      if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
      res.json({ success: true, message: 'Delivery status updated', data: delivery });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
