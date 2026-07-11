import { OrderStatus } from '@foodiego/platform-sdk';

export { OrderStatus };

export class OrderStateMachine {
  constructor(initialState = OrderStatus.CREATED) {
    this.state = initialState;
    this.validTransitions = {
      [OrderStatus.CREATED]: [OrderStatus.PENDING_RESERVATION, OrderStatus.CANCELLED],
      [OrderStatus.PENDING_RESERVATION]: [OrderStatus.READY_FOR_PAYMENT, OrderStatus.CANCELLED],
      [OrderStatus.READY_FOR_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.REFUNDED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERING],
      [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
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
