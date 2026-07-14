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
  getActivePromotions: async (): Promise<Promotion[]> => {
    const res = await api.get<{ success: boolean; data: Promotion[] }>('/promotions/active');
    return res.data.data;
  },

  getAllPromotions: async (): Promise<Promotion[]> => {
    const res = await api.get<{ success: boolean; data: Promotion[] }>('/promotions');
    return res.data.data;
  },

  validateVoucher: async (code: string, orderValue: number): Promise<ValidationResult> => {
    const res = await api.post<{ success: boolean; data: ValidationResult }>('/promotions/validate', {
      code,
      orderValue,
    });
    return res.data.data;
  },

  createPromotion: async (data: CreatePromotionDto): Promise<Promotion> => {
    const res = await api.post<{ success: boolean; data: Promotion }>('/promotions', data);
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
