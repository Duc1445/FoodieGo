import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as OrderModel from './order.model.js';
import * as CartModel from '../cart/cart.model.js';
import * as DeliveryModel from '../delivery/delivery.model.js';

const router = Router();

// ─── POST /api/orders — checkout: cart → order ──────────────────────────────
router.post(
  '/',
  authenticate,
  body('note').optional().isString(),
  body('address').optional().isString(),
  validate,
  async (req, res, next) => {
    try {
      // 1. Get cart items (with price from foods table)
      const cartItems = await CartModel.getCart(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      // 2. Build items array with price from foods join
      const items = cartItems.map((ci) => ({
        food_id: ci.food_id,
        quantity: ci.quantity,
        price: ci.food_price,
      }));

      // 3. Create order + items in a transaction
      const order = await OrderModel.create({
        userId: req.user.id,
        note: req.body.note,
        address: req.body.address,
        items,
      });

      // 4. Create delivery record
      await DeliveryModel.create(order.id);

      // 5. Clear the cart
      await CartModel.clearCart(req.user.id);

      res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/orders — list my orders ───────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await OrderModel.findByUserId(req.user.id);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/orders/:id — get order details ────────────────────────────────
router.get(
  '/:id',
  authenticate,
  param('id').isUUID().withMessage('id must be a valid UUID'),
  validate,
  async (req, res, next) => {
    try {
      const order = await OrderModel.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /api/orders/:id/status — update order status (admin/shipper) ─────
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'shipper'),
  param('id').isUUID().withMessage('id must be a valid UUID'),
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'])
    .withMessage('Invalid order status'),
  validate,
  async (req, res, next) => {
    try {
      const order = await OrderModel.updateStatus(req.params.id, req.body.status);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      res.json({ success: true, message: 'Order status updated', data: order });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
