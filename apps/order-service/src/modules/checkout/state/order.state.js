import { OrderStatus } from '@foodiego/platform-sdk';

export { OrderStatus };

export class OrderStateMachine {
  constructor(initialState = OrderStatus.CREATED) {
    this.state = initialState;
    this.validTransitions = {
      [OrderStatus.CREATED]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
      [OrderStatus.PENDING]: [
        OrderStatus.MERCHANT_ACCEPTED,
        OrderStatus.CANCELLED,
        OrderStatus.EXPIRED,
      ],
      [OrderStatus.MERCHANT_ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
      [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.DRIVER_ACCEPTED, OrderStatus.CANCELLED],
      [OrderStatus.DRIVER_ACCEPTED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.DELIVERING],
      [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [OrderStatus.REFUNDED],
      [OrderStatus.EXPIRED]: [OrderStatus.REFUNDED],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.FAILED]: [],
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
