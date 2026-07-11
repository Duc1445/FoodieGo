import { api } from '../api/api';

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  itemName: string;
  itemPrice: number;
}

export interface OrderDetail {
  id: string;
  userId: string;
  restaurantId: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderSummary {
  id: string;
  restaurantId: string;
  status: string;
  total: number;
  createdAt: string;
}

export const OrderAPI = {
  getOrders: async (): Promise<OrderSummary[]> => {
    const res = await api.get<{ success: boolean; data: OrderSummary[] }>('/orders');
    return res.data.data;
  },

  getOrderDetail: async (orderId: string): Promise<OrderDetail> => {
    const res = await api.get<{ success: boolean; data: OrderDetail }>(`/orders/${orderId}`);
    return res.data.data;
  }
};
