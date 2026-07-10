import { api } from '../lib/api';

export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_available: boolean;
}

export const FoodAPI = {
  getFoods: async (params?: { search?: string; categoryId?: string; limit?: number; offset?: number }) => {
    const res = await api.get<{ success: boolean; data: { items: Food[], pagination: any } }>('/search', { params });
    return res.data.data.items;
  },

  getFoodById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Food }>(`/menus/items/${id}`);
    return res.data.data;
  }
};
