import { api } from '../api/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CheckoutPayload {
  cartVersion: number;
  addressId: string | null;
  paymentMethod: 'cash' | 'card' | 'wallet';
  idempotencyKey: string;
}

export interface CheckoutResult {
  orderId: string;
  status: string;
  total: number;
}

// ─── API ────────────────────────────────────────────────────────────────────

export const CheckoutAPI = {
  /**
   * POST /orders/checkout
   *
   * idempotencyKey is sent both as `Idempotency-Key` header (required by backend)
   * and as `idempotencyKey` in the request body (backend reads from both).
   *
   * The key must be generated once per checkout session (useRef in component)
   * and reused on every retry. It is discarded when the component unmounts.
   */
  checkout: async (payload: CheckoutPayload): Promise<CheckoutResult> => {
    const res = await api.post<{ data: CheckoutResult }>('/orders/checkout', payload, {
      headers: {
        'Idempotency-Key': payload.idempotencyKey,
      },
    });
    return res.data.data;
  },
};
