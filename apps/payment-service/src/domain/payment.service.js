import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentStatus } from './payment.state.js';
import { logger, metrics } from '../app.js';
import crypto from 'crypto';
import { withSpan } from '@foodiego/tracing';

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
    const correlationId = event.metadata?.correlation_id || idempotencyKey;

    metrics.increment('payment_requests_total');

    // 1. Create Payment Record (Idempotent)
    const paymentData = {
      orderId,
      amount,
      currency,
      paymentMethod,
      status: PaymentStatus.CREATED,
      idempotencyKey,
    };

    const { paymentId, isNew } = await this.repository.createPayment(paymentData);

    // Check current status if not new
    const existingPayment = await this.repository.getPaymentByOrderId(orderId);
    if (
      existingPayment.status !== PaymentStatus.CREATED &&
      existingPayment.status !== PaymentStatus.PENDING
    ) {
      logger.info({ paymentId, status: existingPayment.status }, 'Payment already processed');
      return; // Already processed
    }

    // 2. Call Gateway
    try {
      logger.info({ paymentId, amount }, 'Calling Payment Gateway');
      // Update state to PENDING before sending to gateway
      await this.repository.updatePaymentStatus(paymentId, PaymentStatus.PENDING);

      const gatewayRes = await this.gateway.authorize({
        paymentId,
        amount,
        currency,
        paymentMethod,
        idempotencyKey,
      });

      // 3. Handle Synchronous Gateway Response (usually PENDING or DECLINED immediately)
      if (gatewayRes.status === 'DECLINED') {
        const outboxEvent = {
          eventType: 'PaymentFailed',
          eventVersion: 1,
          payload: { orderId, paymentId, reason: gatewayRes.errorReason, traceId },
          metadata: { correlation_id: correlationId, causation_id: idempotencyKey },
        };
        await this.repository.updatePaymentStatus(
          paymentId,
          PaymentStatus.FAILED,
          gatewayRes.gatewayTxId,
          gatewayRes.errorReason,
          outboxEvent,
        );
        metrics.increment('payment_failed_total');
        logger.info({ paymentId, reason: gatewayRes.errorReason }, 'Payment declined by gateway');
      } else {
        // gatewayRes.status === 'PENDING'
        // We do not dispatch PaymentAuthorized yet. We wait for Webhook.
        await this.repository.updatePaymentStatus(
          paymentId,
          PaymentStatus.PENDING,
          gatewayRes.gatewayTxId,
        );
        logger.info({ paymentId }, 'Payment pending asynchronous webhook confirmation');
      }
    } catch (err) {
      metrics.increment('payment_timeout_total');
      logger.error({ paymentId, err: err.message }, 'Gateway error');
      // We don't update DB to FAILED immediately on network errors/timeouts
      // We let the consumer throw, which triggers RabbitMQ Retry mechanisms.
      // The idempotency key ensures we can safely retry this operation.
      throw err;
    }
  }

  async processVerifiedWebhook(
    eventId,
    provider,
    providerTransactionId,
    status,
    payload,
    traceparentHeader,
  ) {
    return await withSpan('Payment Service', async (span) => {
      // This payload is guaranteed to be trusted (verified by WebhookController)
      const { reference } = payload.data; // reference corresponds to paymentId

      const payment = await this.repository.getPaymentById(reference);
      if (!payment) {
        throw new Error(`Payment not found for reference: ${reference}`);
      }

      const correlationId = payment.idempotency_key; // Using idempotencyKey of creation as correlation

      // 4. State transition
      let newStatus = PaymentStatus.FAILED;
      let outboxEvent = null;
      let errorReason = null;

      if (status === 'AUTHORIZED' || status === 'CAPTURED') {
        newStatus = PaymentStatus.AUTHORIZED;
        outboxEvent = {
          eventType: 'PaymentAuthorized',
          eventVersion: 1,
          payload: {
            orderId: payment.order_id,
            paymentId: payment.id,
            gatewayTxId: providerTransactionId,
            amount: payment.amount,
            traceId: payment.idempotency_key, // using idempotencyKey as a fallback traceId context if needed
          },
          metadata: {
            traceparent: traceparentHeader,
            correlation_id: correlationId,
            causation_id: eventId,
          },
        };
      } else {
        errorReason = 'Gateway reported failure via webhook';
        outboxEvent = {
          eventType: 'PaymentFailed',
          eventVersion: 1,
          payload: {
            orderId: payment.order_id,
            paymentId: payment.id,
            reason: errorReason,
            traceId: payment.idempotency_key,
          },
          metadata: {
            traceparent: traceparentHeader,
            correlation_id: correlationId,
            causation_id: eventId,
          },
        };
      }

      // 5. Update DB inside transaction
      await this.repository.updatePaymentAfterWebhook(
        payment.id,
        newStatus,
        providerTransactionId,
        errorReason,
        outboxEvent,
      );

      if (newStatus === PaymentStatus.AUTHORIZED) {
        metrics.increment('payment_authorized_total');
      } else {
        metrics.increment('payment_failed_total');
      }
      logger.info(
        { eventId, paymentId: payment.id, status: newStatus },
        'Webhook business logic processed successfully',
      );
      span.setStatus({ code: 1, message: 'Processed' });
    });
  }
}
