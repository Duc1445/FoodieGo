import { OrderStateMachine, OrderStatus } from '../modules/checkout/state/order.state.js';

describe('OrderStateMachine Exhaustive Tests', () => {
  const allStates = Object.values(OrderStatus);

  // Expected Valid Transitions Map
  const validTransitionsMap = {
    [OrderStatus.CREATED]: [OrderStatus.PENDING_RESERVATION, OrderStatus.CANCELLED],
    [OrderStatus.PENDING_RESERVATION]: [OrderStatus.RESERVED, OrderStatus.FAILED, OrderStatus.CANCELLED],
    [OrderStatus.RESERVED]: [OrderStatus.READY_FOR_PAYMENT, OrderStatus.CANCELLED],
    [OrderStatus.READY_FOR_PAYMENT]: [OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.DELIVERING],
    [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [OrderStatus.REFUNDED],
    [OrderStatus.REFUNDED]: [],
    [OrderStatus.FAILED]: [],
  };

  allStates.forEach((fromState) => {
    describe(`Transitions from ${fromState}`, () => {
      const expectedValidTos = validTransitionsMap[fromState] || [];

      allStates.forEach((toState) => {
        if (fromState === toState) return;

        const isValid = expectedValidTos.includes(toState);

        it(`Should ${isValid ? 'ALLOW' : 'DENY'} transition to ${toState}`, () => {
          const machine = new OrderStateMachine(fromState);
          
          if (isValid) {
            expect(() => machine.transitionTo(toState)).not.toThrow();
            expect(machine.state).toBe(toState);
          } else {
            expect(() => machine.transitionTo(toState)).toThrow(`Invalid state transition from ${fromState} to ${toState}`);
            expect(machine.state).toBe(fromState); // State should not change
          }
        });
      });
    });
  });
});
