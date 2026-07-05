import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as CartModel from '../models/cart.model.js';

const router = Router();

// ─── GET /api/cart — get current user's cart ────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await CartModel.getCart(req.user.id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/cart — add item to cart ──────────────────────────────────────
router.post(
  '/',
  authenticate,
  body('food_id').isUUID().withMessage('food_id must be a valid UUID'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
  validate,
  async (req, res, next) => {
    try {
      const { food_id, quantity } = req.body;
      const item = await CartModel.addItem(req.user.id, food_id, quantity);
      res.status(201).json({ success: true, message: 'Item added to cart', data: item });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/cart/:foodId — update item quantity ───────────────────────────
router.put(
  '/:foodId',
  authenticate,
  param('foodId').isUUID().withMessage('foodId must be a valid UUID'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
  validate,
  async (req, res, next) => {
    try {
      const item = await CartModel.updateItem(req.user.id, req.params.foodId, req.body.quantity);
      if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
      res.json({ success: true, message: 'Cart item updated', data: item });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/cart/:foodId — remove item from cart ────────────────────────
router.delete(
  '/:foodId',
  authenticate,
  param('foodId').isUUID().withMessage('foodId must be a valid UUID'),
  validate,
  async (req, res, next) => {
    try {
      const removed = await CartModel.removeItem(req.user.id, req.params.foodId);
      if (!removed) return res.status(404).json({ success: false, message: 'Cart item not found' });
      res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
