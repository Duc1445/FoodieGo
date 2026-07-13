import { api } from '../api/api';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'customer' | 'merchant' | 'admin' | 'shipper';
  merchant_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  owner_id: string;
  is_active: boolean;
  rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  total_users: number;
  total_restaurants: number;
  total_orders: number;
  active_orders: number;
  pending_merchants: number;
}

export const AdminAPI = {
  // Stats
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get<{ success: boolean; data: AdminStats }>('/admin/stats');
    return res.data.data;
  },

  // User Management
  getAllUsers: async (params?: { role?: string; page?: number; limit?: number }): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: User[] }>(url);
    return res.data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const res = await api.patch<{ success: boolean; data: User }>(`/admin/users/${userId}/role`, { role });
    return res.data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Merchant Management
  getPendingMerchants: async (): Promise<User[]> => {
    const res = await api.get<{ success: boolean; data: User[] }>('/admin/merchants/pending');
    return res.data.data;
  },

  approveMerchant: async (merchantId: string): Promise<User> => {
    const res = await api.patch<{ success: boolean; data: User }>(`/admin/merchants/${merchantId}/approve`);
    return res.data.data;
  },

  rejectMerchant: async (merchantId: string, reason: string): Promise<User> => {
    const res = await api.patch<{ success: boolean; data: User }>(`/admin/merchants/${merchantId}/reject`, { reason });
    return res.data.data;
  },

  // Restaurant Management
  getAllRestaurants: async (params?: { page?: number; limit?: number }): Promise<Restaurant[]> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/admin/restaurants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: Restaurant[] }>(url);
    return res.data.data;
  },

  toggleRestaurantStatus: async (restaurantId: string): Promise<Restaurant> => {
    const res = await api.patch<{ success: boolean; data: Restaurant }>(`/admin/restaurants/${restaurantId}/status`);
    return res.data.data;
  },

  // Order Management
  getAllOrders: async (params?: { status?: string; page?: number; limit?: number }): Promise<Order[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: Order[] }>(url);
    return res.data.data;
  },

  getOrderDetails: async (orderId: string): Promise<Order> => {
    const res = await api.get<{ success: boolean; data: Order }>(`/admin/orders/${orderId}`);
    return res.data.data;
  },
};

export const ADMIN_QUERY_KEY = ['admin'];
