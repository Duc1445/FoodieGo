import { IPaymentGateway } from '../../domain/interfaces/payment-gateway.interface.js';
import crypto from 'crypto';
import { logger } from '../../context.js';
import { v4 as uuidv4 } from 'uuid';

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
  constructor(webhookSecret, repository) {
    super();
    this.webhookSecret = webhookSecret || 'mock-secret';
    this.repository = repository;
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
      case 6:
        return 'FAST_TIMEOUT';
      default:
        return 'SUCCESS';
    }
  }

  async authorize(params) {
    const { paymentId, amount, currency, paymentMethod, idempotencyKey } = params;
    const scenario = this._getScenario(amount);

    logger.info({ paymentId, scenario }, 'MockGateway processing payment authorization');

    if (scenario === 'TIMEOUT') {
      // Simulate a network timeout that exceeds the HTTP client timeout
      await new Promise((resolve) => setTimeout(resolve, 30000));
      throw new Error('Gateway Timeout');
    }

    if (paymentMethod === 'TIMEOUT_TEST' || scenario === 'FAST_TIMEOUT') {
      logger.warn(
        { paymentId, amount, scenario: 'FAST_TIMEOUT' },
        'MockGateway forcing timeout error',
      );

      // Simulate that the gateway DID receive the request and is processing it,
      // it just timed out responding to our synchronous HTTP call.
      // So it will send a webhook later.
      const executeAfter = new Date(Date.now() + 5000);
      await this.repository.createMockGatewayJob(paymentId, 'SUCCESS', executeAfter);

      throw new Error('Gateway Timeout');
    }

    let delayMs = 1000;
    if (scenario === 'SLOW') {
      delayMs = 5000;
    }

    const executeAfter = new Date(Date.now() + delayMs);
    const gatewayTxId = `mock_tx_${crypto.randomBytes(8).toString('hex')}`;

    // Create the background job for the worker to pick up and send the webhook later
    await this.repository.createMockGatewayJob(paymentId, scenario, executeAfter);

    // Always return PENDING asynchronously for real gateways (Stripe, VNPay, etc.)
    return {
      gatewayTxId,
      status: 'PENDING',
    };
  }

  async capture(params) {
    const { paymentId, gatewayTxId, amount } = params;
    logger.info({ paymentId, gatewayTxId, amount }, 'MockGateway processing capture');
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      status: 'CAPTURED',
    };
  }

  async refund(params) {
    const { paymentId, gatewayTxId, amount, idempotencyKey } = params;
    logger.info({ paymentId, gatewayTxId, amount, idempotencyKey }, 'MockGateway processing refund');

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      status: 'REFUNDED',
    };
  }

  async getPayment(params) {
    const { paymentId, gatewayTxId } = params;
    logger.info({ paymentId, gatewayTxId }, 'MockGateway fetching payment status');

    // For mock gateway, we'll just simulate getting a successful status
    // In a real gateway, this would fetch from Stripe/VNPay API.
    return {
      status: 'AUTHORIZED',
      gatewayTxId: gatewayTxId || `mock_tx_${crypto.randomBytes(8).toString('hex')}`,
    };
  }

  /**
   * Helper to generate a webhook payload with signature for testing.
   * In a real system, the external Gateway (e.g. Stripe) would do this.
   */
  generateWebhookPayload(gatewayTxId, status, paymentReference, customTimestamp) {
    const timestamp = customTimestamp || Math.floor(Date.now() / 1000);
    const webhookId = uuidv4();

    const payloadObj = {
      id: webhookId,
      event: 'payment.updated',
      data: {
        tx_id: gatewayTxId,
        reference: paymentReference, // This corresponds to paymentId
        status: status, // e.g. 'AUTHORIZED', 'FAILED'
      },
    };

    // Raw body exactly as it will be transmitted over HTTP
    const rawBody = JSON.stringify(payloadObj);

    // HMAC_SHA256(raw_body, gateway_secret)
    const signature = crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');

    return { rawBody, signature, timestamp, webhookId, payloadObj };
  }
}
