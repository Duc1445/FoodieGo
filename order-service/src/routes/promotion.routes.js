import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { PromotionModel } from '../models/promotion.model.js';

const router = Router();

// GET all promotions
router.get('/', async (req, res, next) => {
  try {
    const promotions = await PromotionModel.findAll();
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

// POST create promotion
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const promotion = await PromotionModel.create(req.body);
    res.status(201).json({ success: true, message: 'Promotion created', data: promotion });
  } catch (err) {
    next(err);
  }
});

// PUT update promotion
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const promotion = await PromotionModel.update(req.params.id, req.body);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }
    res.json({ success: true, message: 'Promotion updated', data: promotion });
  } catch (err) {
    next(err);
  }
});

// DELETE promotion
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const deleted = await PromotionModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
