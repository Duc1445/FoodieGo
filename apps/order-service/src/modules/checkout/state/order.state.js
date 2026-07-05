export const OrderStatus = {
  CREATED: 'CREATED',
  VALIDATING: 'VALIDATING',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERING: 'DELIVERING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

export class OrderStateMachine {
  constructor(initialState = OrderStatus.CREATED) {
    this.state = initialState;
    this.validTransitions = {
      [OrderStatus.CREATED]: [OrderStatus.VALIDATING, OrderStatus.CANCELLED],
      [OrderStatus.VALIDATING]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.REFUNDED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERING],
      [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: []
    };
  }

  canTransitionTo(nextState) {
    return this.validTransitions[this.state]?.includes(nextState) || false;
  }

  transitionTo(nextState) {
    if (!this.canTransitionTo(nextState)) {
      throw new Error(`Invalid state transition from ${this.state} to ${nextState}`);
    }
    this.state = nextState;
    return this.state;
  }
}
