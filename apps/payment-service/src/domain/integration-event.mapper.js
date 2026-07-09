import {
  PaymentAuthorizedV1,
  PaymentCapturedV1,
  PaymentRefundRequestedV1,
  PaymentRefundedV1,
  PaymentFailedV1,
} from '@foodiego/contracts/events/payment/v1/index.js';

export class IntegrationEventMapper {
  static mapDomainToIntegration(domainEvent, contextParams) {
    const { name, payload } = domainEvent;
    const { orderId, traceId } = contextParams;

    switch (name) {
      case 'PaymentAuthorizedDomainEvent':
        return new PaymentAuthorizedV1({
          orderId,
          paymentId: payload.paymentId,
          gatewayTxId: payload.gatewayTxId,
          amount: payload.amount,
          traceId,
        });

      case 'PaymentCapturedDomainEvent':
        return new PaymentCapturedV1({
          orderId,
          paymentId: payload.paymentId,
          gatewayTxId: payload.gatewayTxId,
          amount: payload.amount,
          traceId,
        });

      case 'PaymentRefundRequestedDomainEvent':
        return new PaymentRefundRequestedV1({
          orderId,
          paymentId: payload.paymentId,
          amount: payload.amount,
          reason: payload.reason,
          traceId,
        });

      case 'PaymentRefundedDomainEvent':
        return new PaymentRefundedV1({
          orderId,
          paymentId: payload.paymentId,
          gatewayTxId: payload.gatewayTxId,
          amount: payload.amount,
          traceId,
        });

      case 'PaymentFailedDomainEvent':
        return new PaymentFailedV1({
          orderId,
          paymentId: payload.paymentId,
          reason: payload.reason,
          traceId,
        });

      default:
        return null;
    }
  }
}
