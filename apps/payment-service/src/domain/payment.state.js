export const PaymentStatus = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
};

export class PaymentStateMachine {
  constructor(initialState = PaymentStatus.CREATED) {
    this.state = initialState;
    this.validTransitions = {
      [PaymentStatus.CREATED]: [PaymentStatus.PENDING, PaymentStatus.FAILED],
      [PaymentStatus.PENDING]: [PaymentStatus.AUTHORIZED, PaymentStatus.FAILED, PaymentStatus.EXPIRED],
      [PaymentStatus.AUTHORIZED]: [PaymentStatus.CAPTURED, PaymentStatus.FAILED, PaymentStatus.REFUNDED],
      [PaymentStatus.CAPTURED]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [],
      [PaymentStatus.REFUNDED]: [],
      [PaymentStatus.EXPIRED]: [],
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
