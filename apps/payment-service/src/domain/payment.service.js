
import { PaymentAggregate } from './payment.aggregate.js';
import { IntegrationEventMapper } from './integration-event.mapper.js';
import { PaymentStatus } from './payment.state.js';
import { logger, metrics } from '../context.js';
import { withSpan } from '@foodiego/tracing';

export class PaymentDomainService {
  /**
   * @param {PaymentRepository} repository
   * @param {import('../infrastructure/gateways/gateway.registry.js').GatewayRegistry} gatewayRegistry
   */
  constructor(repository, gatewayRegistry) {
    this.repository = repository;
    this.gatewayRegistry = gatewayRegistry;
  }

  async processPaymentRequest(event) {
    const { orderId, amount, currency, paymentMethod, traceId, providerId } = event.payload;
    const idempotencyKey = event.eventId; // From PaymentRequested EventEnvelope
    const correlationId = event.metadata?.correlation_id || idempotencyKey;

    metrics.increment('payment_requests_total');

    // Resolve Gateway
    const gateway = this.gatewayRegistry.resolve(providerId || 'mock');

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

    // Rehydrate Aggregate
    const existingPayment = await this.repository.getPaymentById(paymentId);
    const aggregate = new PaymentAggregate(paymentId, {
      ...existingPayment,
      orderId: existingPayment.order_id,
      gatewayTxId: existingPayment.gateway_tx_id,
      providerTransactionId: existingPayment.provider_transaction_id,
    });

    if (aggregate.status !== PaymentStatus.CREATED && aggregate.status !== PaymentStatus.PENDING) {
      logger.info({ paymentId, status: aggregate.status }, 'Payment already processed');
      return; 
    }

    // 2. Call Gateway
    try {
      logger.info({ paymentId, amount, providerId }, 'Calling Payment Gateway');
      await this.repository.updatePaymentStatus(paymentId, PaymentStatus.PENDING);

      const gatewayRes = await gateway.authorize({
        paymentId,
        amount,
        currency,
        paymentMethod,
        idempotencyKey,
      });

      if (gatewayRes.status === 'DECLINED') {
        aggregate.fail(gatewayRes.errorReason);
      } else {
        // Wait for webhook for authorization
        await this.repository.updatePaymentStatus(paymentId, PaymentStatus.PENDING, gatewayRes.gatewayTxId);
        logger.info({ paymentId }, 'Payment pending asynchronous webhook confirmation');
        return;
      }

    } catch (err) {
      metrics.increment('payment_timeout_total');
      logger.error({ paymentId, err: err.message }, 'Gateway error');
      throw err;
    }

    // Persist Domain Events if any (e.g. Failure)
    await this._persistAggregateState(aggregate, correlationId, idempotencyKey, event.payload.traceId);
  }

  async processVerifiedWebhook(eventId, provider, providerTransactionId, status, payload, traceparentHeader) {
    return await withSpan('Payment Service', async (span) => {
      const { reference } = payload.data; // reference corresponds to paymentId

      const paymentRecord = await this.repository.getPaymentById(reference);
      if (!paymentRecord) throw new Error(`Payment not found for reference: ${reference}`);

      const aggregate = new PaymentAggregate(paymentRecord.id, {
        ...paymentRecord,
        orderId: paymentRecord.order_id,
        gatewayTxId: paymentRecord.gateway_tx_id,
        providerTransactionId: paymentRecord.provider_transaction_id,
      });

      const correlationId = paymentRecord.idempotency_key;

      if (status === 'AUTHORIZED' || status === 'CAPTURED') {
        if (aggregate.status === PaymentStatus.PENDING) {
           aggregate.authorize(providerTransactionId);
           metrics.increment('payment_authorized_total');
        } else if (aggregate.status === PaymentStatus.AUTHORIZED && status === 'CAPTURED') {
           aggregate.capture(providerTransactionId);
        }
      } else if (status === 'FAILED') {
        aggregate.fail('Gateway reported failure via webhook');
        metrics.increment('payment_failed_total');
      }

      await this._persistAggregateState(aggregate, correlationId, eventId, paymentRecord.idempotency_key, traceparentHeader);
      span.setStatus({ code: 1, message: 'Processed' });
    });
  }

  async refundPayment(orderId, reason, traceId) {
    const paymentRecord = await this.repository.getPaymentByOrderId(orderId);
    if (!paymentRecord) {
      logger.warn({ orderId }, 'No payment found to refund for cancelled order');
      return;
    }

    const aggregate = new PaymentAggregate(paymentRecord.id, {
      ...paymentRecord,
      orderId: paymentRecord.order_id,
      gatewayTxId: paymentRecord.gateway_tx_id,
    });

    if (aggregate.status === PaymentStatus.REFUNDED) return;

    // Must be idempotent
    const refundIdempotencyKey = `${paymentRecord.id}_${reason}_v1`;
    const correlationId = paymentRecord.idempotency_key;

    // Call gateway
    const gateway = this.gatewayRegistry.resolve('mock'); // For now fallback to mock or parse provider
    try {
      logger.info({ paymentId: aggregate.id, reason }, 'Requesting refund from gateway');
      const refundRes = await gateway.refund({
        paymentId: aggregate.id,
        gatewayTxId: aggregate.gatewayTxId,
        amount: aggregate.amount,
        idempotencyKey: refundIdempotencyKey
      });

      if (refundRes.status === 'REFUNDED') {
        aggregate.refund(reason);
      }
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to refund payment');
      throw err;
    }

    await this._persistAggregateState(aggregate, correlationId, refundIdempotencyKey, traceId);
  }

  async _persistAggregateState(aggregate, correlationId, causationId, traceId, traceparent = null) {
    const domainEvents = aggregate.pullDomainEvents();
    
    // We only process the first domain event for simplicity in this PoC Outbox
    // In a real system, you'd insert multiple outbox records.
    let outboxEvent = null;
    
    if (domainEvents.length > 0) {
      const integrationEvent = IntegrationEventMapper.mapDomainToIntegration(domainEvents[0], {
        orderId: aggregate.orderId,
        traceId: traceId
      });

      if (integrationEvent) {
        outboxEvent = {
          eventType: integrationEvent.eventType,
          eventVersion: integrationEvent.eventVersion,
          payload: integrationEvent.payload,
          metadata: {
            traceparent: traceparent,
            correlation_id: correlationId,
            causation_id: causationId,
          }
        };
      }
    }

    await this.repository.updatePaymentAfterWebhook(
      aggregate.id,
      aggregate.status,
      aggregate.gatewayTxId,
      aggregate.errorReason,
      outboxEvent
    );
  }
}
