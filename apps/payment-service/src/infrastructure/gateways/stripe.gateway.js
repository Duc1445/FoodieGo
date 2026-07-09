import { IPaymentGateway } from '../../domain/interfaces/payment-gateway.interface.js';
import { logger } from '../../context.js';

export class StripeGateway extends IPaymentGateway {
  constructor(secretKey) {
    super();
    this.secretKey = secretKey;
  }

  async authorize(params) {
    const { paymentId, amount, currency, idempotencyKey } = params;
    logger.info({ paymentId, amount, currency, idempotencyKey }, 'StripeGateway stub: authorize');
    
    // Simulating Stripe PaymentIntent creation
    return {
      gatewayTxId: `pi_stripe_${Date.now()}`,
      status: 'PENDING',
    };
  }

  async capture(params) {
    const { paymentId, gatewayTxId, amount } = params;
    logger.info({ paymentId, gatewayTxId, amount }, 'StripeGateway stub: capture');
    
    return {
      status: 'CAPTURED',
    };
  }

  async refund(params) {
    const { paymentId, gatewayTxId, amount, idempotencyKey } = params;
    logger.info({ paymentId, gatewayTxId, amount, idempotencyKey }, 'StripeGateway stub: refund');

    return {
      status: 'REFUNDED',
    };
  }
}
