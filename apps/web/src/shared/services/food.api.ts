import { api } from '../api/api';

export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  restaurant_id: string;
  is_available: boolean;
}

export const FoodAPI = {
  getFoodById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Food }>(`/menus/items/${id}`);
    return res.data.data;
  },
  
  // For search, we'll fetch all items - backend doesn't have dedicated search yet
  getAllFoods: async () => {
    const res = await api.get<{ success: boolean; data: Food[] }>('/menus/items');
    return res.data.data;
  }
};
