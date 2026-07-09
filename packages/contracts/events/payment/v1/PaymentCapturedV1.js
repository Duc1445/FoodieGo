export class PaymentCapturedV1 {
  constructor({ orderId, paymentId, gatewayTxId, amount, traceId }) {
    this.eventType = 'PaymentCaptured';
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
