import { api } from '../api/api';

export interface CheckoutPayload {
  cartVersion: number;
  idempotencyKey: string;
  addressId: string;
  paymentMethod: string;
  items: Array<{
    foodId: string;
    quantity: number;
    price: number;
  }>;
  restaurantId: string | null;
  deliveryAddress: string; // The frontend currently collects freeform address instead of addressId
  phone: string;
  notes: string;
  totalAmount: number;
}

export const OrderAPI = {
  checkout: async (payload: CheckoutPayload) => {
    // Send to /orders/checkout endpoint
    // Passing headers explicitly just in case
    const res = await api.post('/orders/checkout', payload, {
      headers: {
        'Idempotency-Key': payload.idempotencyKey
      }
    });
    return res.data;
  }
};
