import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { CategoryModel } from '../models/category.model.js';

const router = Router();

// ─── GET all categories ─────────────────────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const categories = await CategoryModel.findAll();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// ─── GET category by id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// ─── POST create category (admin) ───────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const category = await CategoryModel.create(req.body);
      res.status(201).json({ success: true, message: 'Category created', data: category });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT update category (admin) ─────────────────────────────────────────────
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const category = await CategoryModel.update(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.json({ success: true, message: 'Category updated', data: category });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE category (admin) ─────────────────────────────────────────────────
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const deleted = await CategoryModel.remove(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
