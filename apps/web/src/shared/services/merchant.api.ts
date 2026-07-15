import { api } from '../api/api';
import { OrderDetail as Order } from './order.api';
import { Food as MenuItem } from './food.api';
import { OrderStatus } from '@foodiego/platform-sdk/src/order-status';

// --- Types ---

export type { Order, MenuItem };

export const MERCHANT_MENU_QUERY_KEY = ['merchant-menu'];

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: string;
  status?: string;
  preparation_time?: number;
  // Admin only
  restaurant_id?: string;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category_id?: string;
  status?: string;
  preparation_time?: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

// --- Menu Management ---

export const getMerchantMenu = async (): Promise<MenuItem[]> => {
  const response = await api.get('/menus/merchant/items');
  return response.data.data ?? [];
};

export const getGlobalCategories = async (): Promise<any[]> => {
  const response = await api.get('/categories');
  return response.data.data ?? [];
};

export const createMenuItem = async (data: CreateMenuItemDto): Promise<MenuItem> => {
  const response = await api.post('/menus/items', data);
  return response.data.data;
};

export const updateMenuItem = async (id: string, data: UpdateMenuItemDto): Promise<MenuItem> => {
  const response = await api.put(`/menus/items/${id}`, data);
  return response.data.data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  await api.delete(`/menus/items/${id}`);
};

// --- Order Management ---

export interface MerchantStats {
  total_orders: number;
  total_revenue: number;
  revenue_by_day?: { date: string; revenue: number }[];
  revenue_by_month?: { month: string; revenue: number }[];
}

export const getMerchantStats = async (): Promise<MerchantStats> => {
  const response = await api.get('/orders/merchant/stats');
  return response.data.data;
};

export const getMerchantOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/merchant');
  return response.data.data;
};

export const updateOrderStatus = async (orderId: string, data: UpdateOrderStatusDto): Promise<Order> => {
  const response = await api.patch(`/orders/${orderId}/status`, data);
  return response.data.data;
};
