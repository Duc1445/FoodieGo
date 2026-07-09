export class PaymentRefundedV1 {
  constructor({ orderId, paymentId, gatewayTxId, amount, traceId }) {
    this.eventType = 'PaymentRefunded';
    this.eventVersion = 1;
    this.payload = {
      orderId,
      paymentId,
      gatewayTxId,
      amount,
      traceId,
    };
  }
}
