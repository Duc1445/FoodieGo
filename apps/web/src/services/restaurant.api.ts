import { api } from '../lib/api';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  image_url?: string;
  cover_image: string;
  logo: string;
  is_active: boolean;
  rating: number;
  latitude: number;
  longitude: number;
  delivery_fee: number;
  minimum_order: number;
  total_reviews: number;
  status: string;
  opening_time: string;
  closing_time: string;
}

export const RestaurantAPI = {
  getRestaurants: async () => {
    const res = await api.get<{ success: boolean; data: Restaurant[] }>('/restaurants');
    return res.data.data;
  },
  
  getRestaurantById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Restaurant }>(`/restaurants/${id}`);
    return res.data.data;
  },

  getMenuByRestaurantId: async (id: string) => {
    const res = await api.get<{ success: boolean; data: any[] }>(`/restaurants/${id}/menu`);
    return res.data.data;
  }
};
