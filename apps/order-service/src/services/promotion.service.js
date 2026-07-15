import { PromotionModel } from '../models/promotion.model.js';

export class PromotionService {
  async validateVoucher(code, userId, orderValue, restaurantId) {
    const promotion = await PromotionModel.findByCode(code);

    if (!promotion) {
      return { valid: false, reason: 'Invalid voucher code' };
    }

    if (promotion.approval_status !== 'APPROVED') {
      return { valid: false, reason: 'Voucher is pending approval or was rejected' };
    }

    if (!promotion.is_active) {
      return { valid: false, reason: 'Voucher is inactive' };
    }

    if (promotion.promotion_type === 'merchant') {
      if (!restaurantId) {
        return { valid: false, reason: 'Restaurant context is required for merchant vouchers' };
      }
      if (promotion.restaurant_id !== restaurantId) {
        return { valid: false, reason: 'Voucher does not belong to this restaurant' };
      }
    }

    if (promotion.valid_from && new Date(promotion.valid_from) > new Date()) {
      return { valid: false, reason: 'Voucher is not yet valid' };
    }

    if (promotion.valid_until && new Date(promotion.valid_until) < new Date()) {
      return { valid: false, reason: 'Voucher has expired' };
    }

    if (promotion.min_order_value && orderValue < promotion.min_order_value) {
      return {
        valid: false,
        reason: `Minimum order value is ${Math.round(promotion.min_order_value)} VND`,
      };
    }

    if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
      return { valid: false, reason: 'Voucher usage limit reached' };
    }

    let discountAmount = 0;
    if (promotion.discount_type === 'percentage') {
      discountAmount = orderValue * (promotion.discount_value / 100);
      if (promotion.max_discount_value && discountAmount > promotion.max_discount_value) {
        discountAmount = promotion.max_discount_value;
      }
    } else if (promotion.discount_type === 'fixed') {
      discountAmount = promotion.discount_value;
      if (discountAmount > orderValue) {
        discountAmount = orderValue;
      }
    }

    discountAmount = Math.round(discountAmount);

    return {
      valid: true,
      promotion,
      discountAmount,
      finalAmount: Math.round(orderValue - discountAmount),
    };
  }

  async validateMultipleVouchers(codes, userId, orderValue, restaurantId) {
    if (!codes || codes.length === 0) {
      return { valid: true, discountAmount: 0, promotions: [] };
    }

    const validations = [];
    let currentOrderValue = orderValue;
    let totalDiscount = 0;

    // Fetch and validate all first
    const validPromotions = [];
    for (const code of codes) {
      const validation = await this.validateVoucher(code, userId, orderValue, restaurantId);
      if (!validation.valid) {
        return validation; // fail early if any invalid
      }
      validPromotions.push(validation.promotion);
    }

    // Sort by priority descending
    validPromotions.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Stacking rule: If multiple, all must be stackable
    if (validPromotions.length > 1) {
      const anyUnstackable = validPromotions.some((p) => !p.is_stackable);
      if (anyUnstackable) {
        return { valid: false, reason: 'One or more vouchers cannot be stacked.' };
      }
    }

    const appliedPromotions = [];

    // Apply sequentially
    for (const promotion of validPromotions) {
      // Re-evaluate discount based on currentOrderValue
      let discountAmount = 0;
      if (promotion.discount_type === 'percentage') {
        discountAmount = currentOrderValue * (promotion.discount_value / 100);
        if (promotion.max_discount_value && discountAmount > promotion.max_discount_value) {
          discountAmount = promotion.max_discount_value;
        }
      } else if (promotion.discount_type === 'fixed') {
        discountAmount = promotion.discount_value;
        if (discountAmount > currentOrderValue) {
          discountAmount = currentOrderValue;
        }
      }
      discountAmount = Math.round(discountAmount);

      totalDiscount += discountAmount;
      currentOrderValue -= discountAmount;

      appliedPromotions.push({ promotion, discountAmount });
    }

    return {
      valid: true,
      promotions: appliedPromotions,
      discountAmount: totalDiscount,
      finalAmount: Math.round(currentOrderValue),
    };
  }

  async applyVoucher(code, userId, orderId, orderValue, restaurantId) {
    const validation = await this.validateVoucher(code, userId, orderValue, restaurantId);

    if (!validation.valid) {
      return validation;
    }

    await PromotionModel.recordUsage({
      promotion_id: validation.promotion.id,
      user_id: userId,
      order_id: orderId,
      discount_value: validation.discountAmount,
    });

    await PromotionModel.incrementUsage(validation.promotion.id);

    return validation;
  }

  async getActivePromotions(restaurantId) {
    if (restaurantId) {
      return await PromotionModel.findActiveForRestaurant(restaurantId);
    }
    return await PromotionModel.findActive();
  }

  async getUserVoucherHistory(_userId) {
    return [];
  }
}

export default new PromotionService();
