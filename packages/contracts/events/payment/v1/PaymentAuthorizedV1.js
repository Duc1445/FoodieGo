export class PaymentAuthorizedV1 {
  constructor({ orderId, paymentId, gatewayTxId, amount, traceId }) {
    this.eventType = 'PaymentAuthorized';
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
