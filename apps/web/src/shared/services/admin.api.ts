import { api } from '../api/api';
import { Promotion } from './promotion.api';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'merchant' | 'admin' | 'shipper';
  approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  business_name?: string;
  business_license?: string;
  tax_code?: string;
  identity_card?: string;
  driver_license?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  avatar_url?: string;
  restaurant_images?: any;
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
  total_customers: number;
  total_merchants: number;
  total_shippers: number;
  total_admins: number;
  pending_merchants: number;
  approved_merchants: number;
  pending_shippers: number;
  approved_shippers: number;
  rejected_applications: number;
  
  total_orders: number;
  active_orders: number;
  today_orders: number;
  
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  
  total_promotions: number;
  active_promotions: number;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id: string;
  order_id?: string;
  restaurant_id?: string;
  merchant_id?: string;
  shipper_id?: string;
  issue_type: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  internal_notes?: string;
  assigned_admin?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  restaurant_name?: string;
  order_status?: string;
  order_total?: number;
  assigned_admin_name?: string;
}

export const AdminAPI = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get<{ success: boolean; data: AdminStats }>('/admin/dashboard');
    return res.data.data;
  },

  // Promotion Management
  getAllPromotions: async (params?: { is_active?: boolean; page?: number; limit?: number }): Promise<Promotion[]> => {
    const queryParams = new URLSearchParams();
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/promotions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: Promotion[] }>(url);
    return res.data.data;
  },

  createPromotion: async (data: Partial<Promotion>): Promise<Promotion> => {
    const res = await api.post<{ success: boolean; data: Promotion }>('/promotions', data);
    return res.data.data;
  },

  updatePromotion: async (promotionId: string, data: Partial<Promotion>): Promise<Promotion> => {
    const res = await api.put<{ success: boolean; data: Promotion }>(`/promotions/${promotionId}`, data);
    return res.data.data;
  },

  deletePromotion: async (promotionId: string): Promise<void> => {
    await api.delete(`/promotions/${promotionId}`);
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

  // Approval Management
  getPendingUsers: async (role?: 'merchant' | 'shipper'): Promise<User[]> => {
    const url = role ? `/admin/users/pending?role=${role}` : `/admin/users/pending`;
    const res = await api.get<{ success: boolean; data: User[] }>(url);
    return res.data.data;
  },

  approveUser: async (userId: string): Promise<User> => {
    const res = await api.patch<{ success: boolean; data: User }>(`/admin/users/${userId}/approve`);
    return res.data.data;
  },

  rejectUser: async (userId: string, reason: string): Promise<User> => {
    const res = await api.patch<{ success: boolean; data: User }>(`/admin/users/${userId}/reject`, { reason });
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

  // Support Tickets
  getAllTickets: async (params?: { status?: string; priority?: string; page?: number; limit?: number }): Promise<SupportTicket[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/support${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: SupportTicket[] }>(url);
    return res.data.data;
  },

  getTicketDetails: async (ticketId: string): Promise<SupportTicket> => {
    const res = await api.get<{ success: boolean; data: SupportTicket }>(`/support/${ticketId}`);
    return res.data.data;
  },

  updateTicket: async (ticketId: string, updates: { status?: string; priority?: string; internal_notes?: string }): Promise<SupportTicket> => {
    const res = await api.patch<{ success: boolean; data: SupportTicket }>(`/support/${ticketId}`, updates);
    return res.data.data;
  },
};

export const ADMIN_QUERY_KEY = ['admin'];
