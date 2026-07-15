import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, authorize } from '@foodiego/shared-auth';
import { validate } from '../middlewares/validate.middleware.js';
import { PromotionModel } from '../models/promotion.model.js';
import promotionService from '../services/promotion.service.js';
import pool from '../config/database.js';
import { AuthorizationError, DomainError } from '@foodiego/core';

const router = Router();

async function getMerchantRestaurantId(userId) {
  const { rows } = await pool.query(
    'SELECT restaurant_id FROM user_restaurants WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  if (rows.length === 0) {
    throw new AuthorizationError('Merchant has no associated restaurant');
  }
  return rows[0].restaurant_id;
}

// GET all promotions (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const promotions = await PromotionModel.findAll();
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

// GET pending merchant vouchers (admin only)
router.get('/pending', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const promotions = await PromotionModel.findPendingMerchantVouchers();
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

// GET merchant's own vouchers
router.get('/merchant', authenticate, authorize('merchant'), async (req, res, next) => {
  try {
    const restaurantId = await getMerchantRestaurantId(req.user.id);
    const promotions = await PromotionModel.findByRestaurant(restaurantId);
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

// GET active promotions (public, scoped by restaurant)
router.get('/active', async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const promotions = await promotionService.getActivePromotions(restaurantId);
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

// POST validate voucher code (public - needed for checkout before authentication)
router.post(
  '/validate',
  body('code').trim().notEmpty().withMessage('Voucher code is required'),
  body('orderValue').isFloat({ min: 0 }).withMessage('Order value must be positive'),
  body('restaurantId')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage('Restaurant ID must be a UUID'),
  validate,
  async (req, res, next) => {
    try {
      const { code, orderValue, restaurantId } = req.body;
      // userId is optional for validation - if authenticated, use it for user-specific checks
      const userId = req.user?.id || null;

      const result = await promotionService.validateVoucher(code, userId, orderValue, restaurantId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

// POST create platform promotion (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const promotion = await PromotionModel.create({
      ...req.body,
      promotion_type: 'platform',
      approval_status: 'APPROVED',
      is_active: req.body.is_active ?? true,
    });
    res.status(201).json({ success: true, message: 'Promotion created', data: promotion });
  } catch (err) {
    next(err);
  }
});

// POST create merchant voucher (pending approval)
router.post(
  '/merchant',
  authenticate,
  authorize('merchant'),
  body('code').trim().notEmpty(),
  body('discount_type').isIn(['percentage', 'fixed']),
  body('discount_value').isFloat({ min: 0 }),
  validate,
  async (req, res, next) => {
    try {
      const restaurantId = await getMerchantRestaurantId(req.user.id);
      const promotion = await PromotionModel.create({
        ...req.body,
        promotion_type: 'merchant',
        restaurant_id: restaurantId,
        approval_status: 'PENDING',
        is_active: false,
      });
      res.status(201).json({
        success: true,
        message: 'Voucher submitted for admin approval',
        data: promotion,
      });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH approve merchant voucher (admin only)
router.patch('/:id/approve', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const promotion = await PromotionModel.approve(req.params.id);
    if (!promotion) {
      return res
        .status(404)
        .json({ success: false, message: 'Pending merchant voucher not found' });
    }
    res.json({ success: true, message: 'Voucher approved', data: promotion });
  } catch (err) {
    next(err);
  }
});

// PATCH reject merchant voucher (admin only)
router.patch(
  '/:id/reject',
  authenticate,
  authorize('admin'),
  body('reason').trim().notEmpty().withMessage('Rejection reason is required'),
  validate,
  async (req, res, next) => {
    try {
      const promotion = await PromotionModel.reject(req.params.id, req.body.reason);
      if (!promotion) {
        return res
          .status(404)
          .json({ success: false, message: 'Pending merchant voucher not found' });
      }
      res.json({ success: true, message: 'Voucher rejected', data: promotion });
    } catch (err) {
      next(err);
    }
  },
);

// PUT update promotion (admin: platform; merchant: own pending only)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await PromotionModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    if (req.user.role === 'admin') {
      if (existing.promotion_type !== 'platform') {
        throw new DomainError('Admin can only edit platform promotions via this endpoint');
      }
    } else if (req.user.role === 'merchant') {
      const restaurantId = await getMerchantRestaurantId(req.user.id);
      if (existing.promotion_type !== 'merchant' || existing.restaurant_id !== restaurantId) {
        throw new AuthorizationError('Not authorized to update this voucher');
      }
      if (existing.approval_status === 'APPROVED') {
        throw new DomainError('Approved vouchers cannot be edited');
      }
      if ('is_active' in req.body || 'approval_status' in req.body) {
        throw new AuthorizationError('Merchant cannot activate or approve vouchers');
      }
    } else {
      throw new AuthorizationError('Unauthorized role');
    }

    const promotion = await PromotionModel.update(req.params.id, req.body);
    res.json({ success: true, message: 'Promotion updated', data: promotion });
  } catch (err) {
    next(err);
  }
});

// DELETE promotion
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await PromotionModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    if (req.user.role === 'admin') {
      // admin can delete any
    } else if (req.user.role === 'merchant') {
      const restaurantId = await getMerchantRestaurantId(req.user.id);
      if (existing.promotion_type !== 'merchant' || existing.restaurant_id !== restaurantId) {
        throw new AuthorizationError('Not authorized to delete this voucher');
      }
    } else {
      throw new AuthorizationError('Unauthorized role');
    }

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
