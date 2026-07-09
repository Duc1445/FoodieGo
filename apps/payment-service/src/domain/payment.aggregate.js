import { PaymentStatus, PaymentStateMachine } from './payment.state.js';
import { DomainError } from '@foodiego/core';

export class PaymentAggregate {
  constructor(id, data = {}) {
    this.id = id;
    this.orderId = data.orderId;
    this.amount = data.amount;
    this.currency = data.currency || 'USD';
    this.gatewayTxId = data.gatewayTxId;
    this.providerTransactionId = data.providerTransactionId;
    this.errorReason = data.errorReason;
    this.paymentMethod = data.paymentMethod;

    this.stateMachine = new PaymentStateMachine(data.status || PaymentStatus.CREATED);

    // Internal list of domain events triggered during this transaction
    this._domainEvents = [];
  }

  get status() {
    return this.stateMachine.state;
  }

  pullDomainEvents() {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  _addEvent(name, payload) {
    this._domainEvents.push({
      name,
      payload: { ...payload, paymentId: this.id },
      occurredAt: new Date(),
    });
  }

  authorize(gatewayTxId) {
    this.stateMachine.transitionTo(PaymentStatus.AUTHORIZED);
    this.gatewayTxId = gatewayTxId;

    this._addEvent('PaymentAuthorizedDomainEvent', {
      gatewayTxId: this.gatewayTxId,
      amount: this.amount,
    });
  }

  capture(gatewayTxId) {
    if (!this.stateMachine.canTransitionTo(PaymentStatus.CAPTURED)) {
      throw new DomainError(`Cannot capture payment in status ${this.status}`);
    }
    this.stateMachine.transitionTo(PaymentStatus.CAPTURED);
    if (gatewayTxId) this.gatewayTxId = gatewayTxId;

    this._addEvent('PaymentCapturedDomainEvent', {
      gatewayTxId: this.gatewayTxId,
      amount: this.amount,
    });
  }

  refund(reason = 'Customer requested refund') {
    if (!this.stateMachine.canTransitionTo(PaymentStatus.REFUNDED)) {
      throw new DomainError(`Cannot refund payment in status ${this.status}`);
    }

    // We don't transition to REFUNDED immediately here.
    // We request refund via gateway. Actually wait, refund() here implies the gateway refund was successful,
    // OR it means we are requesting it. Let's say this aggregate just tracks state.
    // If the Domain Service uses this to mark it refunded after gateway success:
    this.stateMachine.transitionTo(PaymentStatus.REFUNDED);

    this._addEvent('PaymentRefundedDomainEvent', {
      gatewayTxId: this.gatewayTxId,
      amount: this.amount,
      reason,
    });
  }

  requestRefund(reason) {
    // If we want to emit a request without changing status yet,
    // or we might transition to a REFUND_PENDING state.
    // For now, based on instructions, we emit PaymentRefundRequested.
    this._addEvent('PaymentRefundRequestedDomainEvent', {
      amount: this.amount,
      reason,
    });
  }

  fail(reason) {
    this.stateMachine.transitionTo(PaymentStatus.FAILED);
    this.errorReason = reason;

    this._addEvent('PaymentFailedDomainEvent', {
      reason,
    });
  }

  expire(reason) {
    this.stateMachine.transitionTo(PaymentStatus.EXPIRED);
    this.errorReason = reason;

    this._addEvent('PaymentFailedDomainEvent', {
      reason: `Expired: ${reason}`,
    });
  }
}
