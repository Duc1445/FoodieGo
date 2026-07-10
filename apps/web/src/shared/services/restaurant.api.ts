import { api } from '../api/api';

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

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export type RestaurantList = Restaurant[] & { pagination?: PaginationData };

export const RestaurantAPI = {
  getRestaurants: async (params?: { page?: number; limit?: number; search?: string }): Promise<RestaurantList> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    
    const url = `/restaurants${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: Restaurant[]; pagination?: PaginationData }>(url);
    
    const result = res.data.data as RestaurantList;
    if (res.data.pagination) {
      result.pagination = res.data.pagination;
    }
    return result;
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
