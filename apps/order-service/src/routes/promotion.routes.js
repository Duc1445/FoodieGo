import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { PromotionModel } from '../models/promotion.model.js';
import promotionService from '../services/promotion.service.js';

const router = Router();

// GET all promotions (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const promotions = await PromotionModel.findAll();
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

// GET active promotions (public)
router.get('/active', async (req, res, next) => {
  try {
    const promotions = await promotionService.getActivePromotions();
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

// POST validate voucher code
router.post('/validate',
  authenticate,
  body('code').trim().notEmpty().withMessage('Voucher code is required'),
  body('orderValue').isFloat({ min: 0 }).withMessage('Order value must be positive'),
  validate,
  async (req, res, next) => {
    try {
      const { code, orderValue } = req.body;
      const userId = req.user.id;
      
      const result = await promotionService.validateVoucher(code, userId, orderValue);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

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
