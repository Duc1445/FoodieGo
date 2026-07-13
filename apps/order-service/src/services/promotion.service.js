import { PromotionModel } from '../models/promotion.model.js';

export class PromotionService {
  /**
   * Validate a voucher code for a user and order
   */
  async validateVoucher(code, userId, orderValue) {
    const promotion = await PromotionModel.findByCode(code);

    if (!promotion) {
      return { valid: false, reason: 'Invalid voucher code' };
    }

    if (!promotion.is_active) {
      return { valid: false, reason: 'Voucher is inactive' };
    }

    // Check validity dates
    if (promotion.valid_from && new Date(promotion.valid_from) > new Date()) {
      return { valid: false, reason: 'Voucher is not yet valid' };
    }

    if (promotion.valid_until && new Date(promotion.valid_until) < new Date()) {
      return { valid: false, reason: 'Voucher has expired' };
    }

    // Check minimum order value
    if (promotion.min_order_value && orderValue < promotion.min_order_value) {
      return { valid: false, reason: `Minimum order value is ${promotion.min_order_value}` };
    }

    // Check usage limit
    if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
      return { valid: false, reason: 'Voucher usage limit reached' };
    }

    // Check if user already used this voucher (optional - can be configured per promotion)
    // This would require checking promotion_usages table

    // Calculate discount
    let discountAmount = 0;
    if (promotion.discount_type === 'percentage') {
      discountAmount = orderValue * (promotion.discount_value / 100);
      // Apply max discount cap if exists
      if (promotion.max_discount_value && discountAmount > promotion.max_discount_value) {
        discountAmount = promotion.max_discount_value;
      }
    } else if (promotion.discount_type === 'fixed') {
      discountAmount = promotion.discount_value;
      // Ensure discount doesn't exceed order value
      if (discountAmount > orderValue) {
        discountAmount = orderValue;
      }
    }

    return {
      valid: true,
      promotion,
      discountAmount,
      finalAmount: orderValue - discountAmount
    };
  }

  /**
   * Apply voucher to order
   */
  async applyVoucher(code, userId, orderId, orderValue) {
    const validation = await this.validateVoucher(code, userId, orderValue);

    if (!validation.valid) {
      return validation;
    }

    // Record usage
    await PromotionModel.recordUsage({
      promotion_id: validation.promotion.id,
      user_id: userId,
      order_id: orderId,
      discount_value: validation.discountAmount
    });

    // Increment usage count
    await PromotionModel.incrementUsage(validation.promotion.id);

    return validation;
  }

  /**
   * Get active promotions for a user
   */
  async getActivePromotions() {
    return await PromotionModel.findActive();
  }

  /**
   * Get user's voucher usage history
   */
  async getUserVoucherHistory(userId) {
    // This would require a new query in PromotionModel
    // For now, return empty array
    return [];
  }
}

export default new PromotionService();
