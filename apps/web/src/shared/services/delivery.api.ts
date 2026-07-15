import { api } from '../api/api';

// --- Types ---

export interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  status: 'waiting' | 'accepted' | 'picked_up' | 'delivering' | 'delivered';
  note?: string;
  deliveryFee?: number;
  total?: number;
  customerId?: string;
  customerName?: string;
  restaurantName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryListParams {
  status?: 'waiting' | 'accepted' | 'picked_up' | 'delivering' | 'delivered';
  orderId?: string;
  driverId?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// --- API Functions ---

export const DeliveryAPI = {
  listDeliveries: async (params?: DeliveryListParams): Promise<Delivery[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.orderId) queryParams.append('orderId', params.orderId);
    if (params?.driverId) queryParams.append('driverId', params.driverId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const url = `/delivery${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get<{ success: boolean; data: Delivery[] }>(url);
    return res.data.data;
  },

  getDeliveryByOrder: async (orderId: string): Promise<Delivery> => {
    const res = await api.get<{ success: boolean; data: Delivery }>(`/delivery/order/${orderId}`);
    return res.data.data;
  },

  acceptDelivery: async (deliveryId: string): Promise<Delivery> => {
    const res = await api.patch<{ success: boolean; message: string; data: Delivery }>(`/delivery/${deliveryId}/accept`);
    return res.data.data;
  },

  updateDeliveryStatus: async (deliveryId: string, status: 'waiting' | 'accepted' | 'picked_up' | 'delivering' | 'delivered'): Promise<Delivery> => {
    const res = await api.patch<{ success: boolean; message: string; data: Delivery }>(`/delivery/${deliveryId}/status`, { status });
    return res.data.data;
  },

  getDriverStats: async (): Promise<{ total_deliveries: number; total_earnings: number; today_deliveries: number; today_earnings: number; monthly_earnings: number; earnings_by_day?: { date: string; earnings: number }[] }> => {
    const res = await api.get<{ success: boolean; data: { total_deliveries: number; total_earnings: number; today_deliveries: number; today_earnings: number; monthly_earnings: number; earnings_by_day?: { date: string; earnings: number }[] } }>('/delivery/stats');
    return res.data.data;
  },
};

export const DRIVER_DELIVERIES_QUERY_KEY = ['driver-deliveries'];
