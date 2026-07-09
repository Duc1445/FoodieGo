export class PaymentFailedV1 {
  constructor({ orderId, paymentId, reason, traceId }) {
    this.eventType = 'PaymentFailed';
    this.eventVersion = 1;
    this.payload = {
      orderId,
      paymentId,
      reason,
      traceId,
    };
  }
}
