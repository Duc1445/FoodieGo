export declare const OrderStatus: {
  readonly CREATED: 'CREATED';
  readonly PENDING: 'PENDING';
  readonly PENDING_RESERVATION: 'PENDING_RESERVATION';
  readonly RESERVED: 'RESERVED';
  readonly READY_FOR_PAYMENT: 'READY_FOR_PAYMENT';
  readonly PAID: 'PAID';
  readonly CONFIRMED: 'CONFIRMED';
  readonly PREPARING: 'PREPARING';
  readonly READY: 'READY';
  readonly DELIVERING: 'DELIVERING';
  readonly COMPLETED: 'COMPLETED';
  readonly CANCELLED: 'CANCELLED';
  readonly REFUNDED: 'REFUNDED';
  readonly FAILED: 'FAILED';
};

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
