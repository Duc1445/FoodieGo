import { api } from '../lib/api';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  image_url: string;
  is_active: boolean;
  rating: number;
}

export const RestaurantAPI = {
  getRestaurants: async () => {
    const res = await api.get<{ success: boolean; data: Restaurant[] }>('/restaurants');
    return res.data.data;
  },
  
  getRestaurantById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Restaurant }>(`/restaurants/${id}`);
    return res.data.data;
  }
};
