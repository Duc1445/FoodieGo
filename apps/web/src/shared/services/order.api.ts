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
  paymentMethod?: string;
  promotions?: { code: string; type: string; value: number; amount: number }[];
  delivery?: { driverId?: string; name?: string; phone?: string; vehicleInfo?: string; status?: string };
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  merchantAcceptedAt?: string;
  preparingAt?: string;
  readyForPickupAt?: string;
  deliveringAt?: string;
  completedAt?: string;
  cancelledAt?: string;
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
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<OrderDetail> => {
    const res = await api.patch<{ success: boolean; data: OrderDetail }>(`/orders/${orderId}/status`, { status });
    return res.data.data;
  }
};
