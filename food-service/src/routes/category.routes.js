import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { CategoryModel } from '../models/category.model.js';
import redis from '../config/redis.js';

const router = Router();

// ─── GET all categories ─────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const cached = await redis.get('categories:all');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }
    const categories = await CategoryModel.findAll();
    await redis.set('categories:all', JSON.stringify(categories), 'EX', 3600); // 1 hour
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

// ─── POST create category (admin) ───────────────────────────────────────────// POST /api/categories - admin
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
    body('image_url').optional().isURL().withMessage('Valid URL required')
  ],
  validate,
  async (req, res) => {
    try {
      const category = await CategoryModel.create(req.body);
      await redis.del('categories:all');
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: 'Category name exists' });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/categories/:id - admin
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    param('id').isUUID().withMessage('Invalid category ID'),
    body('name').optional().notEmpty(),
    body('description').optional().isString(),
    body('image_url').optional().isURL(),
    body('is_active').optional().isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const category = await CategoryModel.update(req.params.id, req.body);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      await redis.del('categories:all');
      res.json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/categories/:id - admin
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isUUID().withMessage('Invalid category ID')],
  validate,
  async (req, res) => {
    try {
      const success = await CategoryModel.remove(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Category not found' });
      await redis.del('categories:all');
      res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
