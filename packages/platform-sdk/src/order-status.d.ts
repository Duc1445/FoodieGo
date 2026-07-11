export declare const OrderStatus: {
  readonly CREATED: 'CREATED';
  readonly PENDING_RESERVATION: 'PENDING_RESERVATION';
  readonly READY_FOR_PAYMENT: 'READY_FOR_PAYMENT';
  readonly PAID: 'PAID';
  readonly CONFIRMED: 'CONFIRMED';
  readonly PREPARING: 'PREPARING';
  readonly READY: 'READY';
  readonly DELIVERING: 'DELIVERING';
  readonly COMPLETED: 'COMPLETED';
  readonly CANCELLED: 'CANCELLED';
  readonly REFUNDED: 'REFUNDED';
};

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
