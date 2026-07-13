import { api } from '../api/api';

export interface Promotion {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimit?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
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
