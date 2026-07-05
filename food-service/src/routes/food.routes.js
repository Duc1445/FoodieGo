import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { FoodModel } from '../models/food.model.js';

const router = Router();

// ─── GET all foods (with pagination & filters) ──────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, search, category_id } = req.query;
    const result = await FoodModel.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      category_id,
    });
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET food by id ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const food = await FoodModel.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }
    res.json({ success: true, data: food });
  } catch (err) {
    next(err);
  }
});

// ─── POST create food (admin) ────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const food = await FoodModel.create(req.body);
      res.status(201).json({ success: true, message: 'Food created', data: food });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT update food (admin) ─────────────────────────────────────────────────
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const food = await FoodModel.update(req.params.id, req.body);
      if (!food) {
        return res.status(404).json({ success: false, message: 'Food not found' });
      }
      res.json({ success: true, message: 'Food updated', data: food });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE food (admin) ─────────────────────────────────────────────────────
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const deleted = await FoodModel.remove(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Food not found' });
      }
      res.json({ success: true, message: 'Food deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
