import { api } from '../api/api';

export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  restaurant_id: string;
  status: string;
  preparation_time?: number;
}

export const FoodAPI = {
  getFoodById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Food }>(`/menus/items/${id}`);
    return res.data.data;
  },
  
  getAllFoods: async (params?: { q?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ success: boolean; data: Food[] }>('/menus/items', { params });
    return res.data.data;
  }
};
