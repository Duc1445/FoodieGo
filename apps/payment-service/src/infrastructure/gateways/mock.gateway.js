import { IPaymentGateway } from '../../domain/interfaces/payment-gateway.interface.js';
import crypto from 'crypto';
import { logger } from '../../index.js';

/**
 * Mock Gateway supporting deterministic scenarios based on amount.
 *
 * Scenarios:
 * X.01 => SUCCESS
 * X.02 => FAIL (Declined)
 * X.03 => TIMEOUT (Gateway hangs / timeouts)
 * X.04 => SLOW (Delayed response)
 * X.05 => DUPLICATE_WEBHOOK (Will simulate sending webhook twice later)
 * Default => SUCCESS
 */
export class MockGateway extends IPaymentGateway {
  constructor(webhookSecret) {
    super();
    this.webhookSecret = webhookSecret || 'mock-secret';
  }

  _getScenario(amount) {
    const cents = Math.round(amount * 100) % 100;
    switch (cents) {
      case 1:
        return 'SUCCESS';
      case 2:
        return 'FAIL';
      case 3:
        return 'TIMEOUT';
      case 4:
        return 'SLOW';
      case 5:
        return 'DUPLICATE_WEBHOOK';
      default:
        return 'SUCCESS';
    }
  }

  async processPayment(params) {
    const { paymentId, amount, currency, paymentMethod, idempotencyKey } = params;
    const scenario = this._getScenario(amount);

    logger.info({ paymentId, scenario }, 'MockGateway processing payment');

    if (scenario === 'TIMEOUT') {
      // Simulate a network timeout that exceeds the HTTP client timeout
      await new Promise((resolve) => setTimeout(resolve, 30000));
      throw new Error('Gateway Timeout');
    }

    if (scenario === 'SLOW') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const gatewayTxId = `mock_tx_${crypto.randomBytes(8).toString('hex')}`;

    if (scenario === 'FAIL') {
      return {
        gatewayTxId,
        status: 'DECLINED',
        errorReason: 'Insufficient funds',
      };
    }

    return {
      gatewayTxId,
      status: 'AUTHORIZED', // Usually gateway returns authorized initially, then captures
    };
  }

  async refundPayment(params) {
    const { gatewayTxId, amount, reason } = params;
    logger.info({ gatewayTxId, amount, reason }, 'MockGateway processing refund');

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      status: 'REFUNDED',
    };
  }

  /**
   * Helper to generate a webhook payload with signature for testing
   */
  generateWebhookPayload(gatewayTxId, status) {
    const payload = {
      event: 'payment.updated',
      data: {
        tx_id: gatewayTxId,
        status: status, // e.g. 'CAPTURED', 'FAILED'
        timestamp: new Date().toISOString(),
      },
    };

    const signature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return { payload, signature };
  }
}
