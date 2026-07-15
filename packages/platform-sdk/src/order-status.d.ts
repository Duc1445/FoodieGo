export declare const OrderStatus: {
  readonly CREATED: 'CREATED';
  readonly PENDING: 'PENDING';
  readonly MERCHANT_ACCEPTED: 'MERCHANT_ACCEPTED';
  readonly PREPARING: 'PREPARING';
  readonly READY_FOR_PICKUP: 'READY_FOR_PICKUP';
  readonly DRIVER_ACCEPTED: 'DRIVER_ACCEPTED';
  readonly PICKED_UP: 'PICKED_UP';
  readonly DELIVERING: 'DELIVERING';
  readonly COMPLETED: 'COMPLETED';
  readonly CANCELLED: 'CANCELLED';
  readonly EXPIRED: 'EXPIRED';
  readonly REFUNDED: 'REFUNDED';
  readonly FAILED: 'FAILED';
};

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
