import { api } from '../api/api';

export interface Promotion {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount_value?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  promotion_type?: 'platform' | 'merchant';
  restaurant_id?: string;
  restaurant_name?: string;
  approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  promotion?: Promotion;
  discountAmount?: number;
  finalAmount?: number;
}

export interface CreatePromotionDto {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount_value?: number;
  usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

export const PromotionAPI = {
  getActivePromotions: async (restaurantId?: string): Promise<Promotion[]> => {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    const res = await api.get<{ success: boolean; data: Promotion[] }>(`/promotions/active${query}`);
    return res.data.data;
  },

  getAllPromotions: async (): Promise<Promotion[]> => {
    const res = await api.get<{ success: boolean; data: Promotion[] }>('/promotions');
    return res.data.data;
  },

  getPendingVouchers: async (): Promise<Promotion[]> => {
    const res = await api.get<{ success: boolean; data: Promotion[] }>('/promotions/pending');
    return res.data.data;
  },

  getMerchantVouchers: async (): Promise<Promotion[]> => {
    const res = await api.get<{ success: boolean; data: Promotion[] }>('/promotions/merchant');
    return res.data.data;
  },

  validateVoucher: async (code: string, orderValue: number, restaurantId?: string): Promise<ValidationResult> => {
    const res = await api.post<{ success: boolean; data: ValidationResult }>('/promotions/validate', {
      code,
      orderValue,
      restaurantId,
    });
    return res.data.data;
  },

  createPromotion: async (data: CreatePromotionDto): Promise<Promotion> => {
    const res = await api.post<{ success: boolean; data: Promotion }>('/promotions', data);
    return res.data.data;
  },

  createMerchantVoucher: async (data: CreatePromotionDto): Promise<Promotion> => {
    const res = await api.post<{ success: boolean; data: Promotion }>('/promotions/merchant', data);
    return res.data.data;
  },

  approveVoucher: async (id: string): Promise<Promotion> => {
    const res = await api.patch<{ success: boolean; data: Promotion }>(`/promotions/${id}/approve`);
    return res.data.data;
  },

  rejectVoucher: async (id: string, reason: string): Promise<Promotion> => {
    const res = await api.patch<{ success: boolean; data: Promotion }>(`/promotions/${id}/reject`, { reason });
    return res.data.data;
  },

  updatePromotion: async (id: string, data: Partial<CreatePromotionDto>): Promise<Promotion> => {
    const res = await api.put<{ success: boolean; data: Promotion }>(`/promotions/${id}`, data);
    return res.data.data;
  },

  deletePromotion: async (id: string): Promise<void> => {
    await api.delete(`/promotions/${id}`);
  },
};

export const PROMOTIONS_QUERY_KEY = ['promotions'];
