import { IPaymentGateway } from '../../domain/interfaces/payment-gateway.interface.js';
import { logger } from '../../context.js';

export class VNPayGateway extends IPaymentGateway {
  constructor(tmnCode, secretKey) {
    super();
    this.tmnCode = tmnCode;
    this.secretKey = secretKey;
  }

  async authorize(params) {
    const { paymentId, amount, idempotencyKey } = params;
    logger.info({ paymentId, amount, idempotencyKey }, 'VNPayGateway stub: authorize');
    
    return {
      gatewayTxId: `vnpay_${Date.now()}`,
      status: 'PENDING',
    };
  }

  async capture(params) {
    const { paymentId, gatewayTxId, amount } = params;
    logger.info({ paymentId, gatewayTxId, amount }, 'VNPayGateway stub: capture');
    
    return {
      status: 'CAPTURED',
    };
  }

  async refund(params) {
    const { paymentId, gatewayTxId, amount, idempotencyKey } = params;
    logger.info({ paymentId, gatewayTxId, amount, idempotencyKey }, 'VNPayGateway stub: refund');

    return {
      status: 'REFUNDED',
    };
  }
}
