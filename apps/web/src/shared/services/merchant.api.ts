import { api } from '../api/api';
import { OrderDetail as Order } from './order.api';
import { Food as MenuItem } from './food.api';
import { OrderStatus } from '@foodiego/platform-sdk/src/order-status';

// --- Types ---

export type { Order, MenuItem };

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: string;
  is_available?: boolean;
  // Admin only
  restaurant_id?: string;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category_id?: string;
  is_active?: boolean;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

// --- Menu Management ---

export const getMerchantMenu = async (): Promise<MenuItem[]> => {
  const response = await api.get('/menus/merchant/items');
  return response.data.data;
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

export const getMerchantOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/merchant');
  return response.data.data;
};

export const updateOrderStatus = async (orderId: string, data: UpdateOrderStatusDto): Promise<Order> => {
  const response = await api.patch(`/orders/${orderId}/status`, data);
  return response.data.data;
};
