import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentStatus } from './payment.state.js';
import { logger } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class PaymentDomainService {
  /**
   * @param {PaymentRepository} repository
   * @param {import('./interfaces/payment-gateway.interface.js').IPaymentGateway} gateway
   */
  constructor(repository, gateway) {
    this.repository = repository;
    this.gateway = gateway;
  }

  async processPaymentRequest(event) {
    const { orderId, amount, currency, paymentMethod, traceId } = event.payload;
    const idempotencyKey = event.eventId; // From PaymentRequested EventEnvelope

    // 1. Create Payment Record (Idempotent)
    const paymentData = {
      orderId,
      amount,
      currency,
      paymentMethod,
      status: PaymentStatus.PENDING,
      idempotencyKey,
    };

    const { paymentId, isNew } = await this.repository.createPayment(paymentData);

    // Check current status if not new
    const existingPayment = await this.repository.getPaymentByOrderId(orderId);
    if (existingPayment.status !== PaymentStatus.PENDING) {
      logger.info({ paymentId, status: existingPayment.status }, 'Payment already processed');
      return; // Already processed
    }

    // 2. Call Gateway
    try {
      logger.info({ paymentId, amount }, 'Calling Payment Gateway');
      const gatewayRes = await this.gateway.processPayment({
        paymentId,
        amount,
        currency,
        paymentMethod,
        idempotencyKey,
      });

      // 3. Handle Gateway Response
      if (gatewayRes.status === 'AUTHORIZED' || gatewayRes.status === 'CAPTURED') {
        const outboxEvent = {
          eventType: 'PaymentSucceeded',
          eventVersion: 1,
          payload: {
            orderId,
            paymentId,
            gatewayTxId: gatewayRes.gatewayTxId,
            amount,
            traceId,
          },
        };
        await this.repository.updatePaymentStatus(
          paymentId,
          PaymentStatus.AUTHORIZED,
          gatewayRes.gatewayTxId,
          null,
          outboxEvent,
        );
        logger.info({ paymentId }, 'Payment successful');
      } else {
        const outboxEvent = {
          eventType: 'PaymentFailed',
          eventVersion: 1,
          payload: {
            orderId,
            paymentId,
            reason: gatewayRes.errorReason,
            traceId,
          },
        };
        await this.repository.updatePaymentStatus(
          paymentId,
          PaymentStatus.FAILED,
          gatewayRes.gatewayTxId,
          gatewayRes.errorReason,
          outboxEvent,
        );
        logger.info({ paymentId, reason: gatewayRes.errorReason }, 'Payment declined');
      }
    } catch (err) {
      logger.error({ paymentId, err: err.message }, 'Gateway error');
      // We don't update DB to FAILED immediately on network errors/timeouts
      // We let the consumer throw, which triggers RabbitMQ Retry mechanisms.
      // The idempotency key ensures we can safely retry this operation.
      throw err;
    }
  }
}
