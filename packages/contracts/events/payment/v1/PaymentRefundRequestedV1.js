export class PaymentRefundRequestedV1 {
  constructor({ orderId, paymentId, amount, reason, traceId }) {
    this.eventType = 'PaymentRefundRequested';
    this.eventVersion = 1;
    this.payload = {
      orderId,
      paymentId,
      amount,
      reason,
      traceId,
    };
  }
}
