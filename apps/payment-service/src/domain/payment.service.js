import { PaymentAggregate } from './payment.aggregate.js';
import { IntegrationEventMapper } from './integration-event.mapper.js';
import { PaymentStatus } from './payment.state.js';
import { logger, metrics } from '../context.js';
import { withSpan } from '@foodiego/tracing';
import pool from '../config/database.js';

export class PaymentDomainService {
  constructor(repository, gatewayRegistry) {
    this.repository = repository;
    this.gatewayRegistry = gatewayRegistry;
  }

  async processPaymentRequest(event) {
    const { orderId, amount, currency, paymentMethod, traceId, providerId } = event.payload;
    const idempotencyKey = event.eventId; 
    const correlationId = event.metadata?.correlation_id || idempotencyKey;

    metrics.increment('payment_requests_total');

    const gateway = this.gatewayRegistry.resolve(providerId || 'mock');

    const paymentData = {
      orderId,
      amount,
      currency,
      paymentMethod,
      gatewayProvider: providerId || 'mock',
      status: PaymentStatus.CREATED,
      idempotencyKey,
    };

    const { paymentId, isNew } = await this.repository.createPayment(paymentData);

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

    try {
      logger.info({ paymentId, orderId, amount, gateway: providerId || 'mock', eventId: idempotencyKey }, 'Calling Payment Gateway');
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
        await this.repository.updatePaymentStatus(
          paymentId,
          PaymentStatus.PENDING,
          gatewayRes.gatewayTxId,
        );
        logger.info({ paymentId }, 'Payment pending asynchronous webhook confirmation');
        return;
      }
    } catch (err) {
      metrics.increment('payment_timeout_total');
      logger.error({ paymentId, orderId, gateway: providerId || 'mock', err: err.message }, 'Gateway error — payment timeout');
      throw err;
    }

    // Persist Domain Events without outbox
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await this._persistAggregateState(aggregate, correlationId, idempotencyKey, event.payload.traceId, null, client);
        await client.query('COMMIT');
    } catch(err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
  }

  async processVerifiedWebhook(
    eventId,
    provider,
    providerTransactionId,
    status,
    payload,
    traceparentHeader,
    trx
  ) {
    return await withSpan('Process Webhook Event', async (span) => {
      const { reference } = payload.data; 
      span.setAttribute('event.id', eventId);
      span.setAttribute('event.status', status);

      const paymentRecord = await this.repository.getPaymentByIdForUpdate(trx, reference);
      if (!paymentRecord) throw new Error(`Payment not found for reference: ${reference}`);

      span.setAttribute('paymentId', paymentRecord.id);

      if (payload.sequence && paymentRecord.gateway_sequence) {
        if (payload.sequence <= paymentRecord.gateway_sequence) {
          logger.info({ paymentId: paymentRecord.id, seq: payload.sequence, storedSeq: paymentRecord.gateway_sequence }, 'Dropping older webhook sequence');
          span.setStatus({ code: 1, message: 'Dropped: stale sequence' });
          return;
        }
      }

      const aggregate = new PaymentAggregate(paymentRecord.id, {
        ...paymentRecord,
        orderId: paymentRecord.order_id,
        gatewayTxId: paymentRecord.gateway_tx_id,
        providerTransactionId: paymentRecord.provider_transaction_id,
      });

      if (status === 'AUTHORIZED' || status === 'CAPTURED') {
        if (aggregate.status === PaymentStatus.PENDING || aggregate.status === PaymentStatus.UNKNOWN || aggregate.status === PaymentStatus.CREATED) {
          aggregate.authorize(providerTransactionId);
          metrics.increment('payment_authorized_total');
        } else if (aggregate.status === PaymentStatus.AUTHORIZED && status === 'CAPTURED') {
          aggregate.capture(providerTransactionId);
        }
      } else if (status === 'FAILED') {
        if (aggregate.status !== PaymentStatus.FAILED) {
           aggregate.fail('Gateway reported failure via webhook');
           metrics.increment('payment_failed_total');
        }
      }

      if (aggregate.status === paymentRecord.status) {
        span.setStatus({ code: 1, message: 'No-op: status unchanged' });
        return;
      }

      const correlationId = paymentRecord.idempotency_key;
      const outboxEvents = this._buildOutboxEvent(aggregate, correlationId, eventId, traceparentHeader);
      
      // DB UPDATE and INSERT — child spans auto-emitted by OTel pg instrumentation
      const updated = await this.repository.tryTransitionStatus(
        trx, 
        aggregate.id, 
        paymentRecord.status, 
        aggregate.status,
        {
          gatewaySequence: payload.sequence,
          providerTransactionId: providerTransactionId
        }
      );

      if (updated) {
        for(const event of outboxEvents) {
           await this.repository._insertOutboxEvent(trx, aggregate.id, event);
        }
      }

      span.setStatus({ code: 1, message: 'Processed' });
    });
  }

  async refundPayment(orderId, reason, traceId) {
    return await withSpan('Refund Flow', async (rootSpan) => {
      metrics.increment('payment_refund_requests_total');
      
      const paymentRecord = await this.repository.getPaymentByOrderId(orderId);
      if (!paymentRecord) {
        logger.warn({ orderId }, 'No payment found to refund for cancelled order');
        return;
      }

      rootSpan.setAttribute('paymentId', paymentRecord.id);

      const aggregate = new PaymentAggregate(paymentRecord.id, {
        ...paymentRecord,
        orderId: paymentRecord.order_id,
        gatewayTxId: paymentRecord.gateway_tx_id,
      });

      if (aggregate.status === PaymentStatus.REFUNDED) return;

      const refundIdempotencyKey = `refund_${paymentRecord.id}`;
      const correlationId = paymentRecord.idempotency_key;

      const client = await pool.connect();
      let updated;
      try {
         await withSpan('Acquire Refund Ownership', async (acquireSpan) => {
           await client.query('BEGIN');

           const lockedPayment = await this.repository.tryLockForRefund(client, orderId);
           if (!lockedPayment) {
               await client.query('ROLLBACK');
               return;
           }

           aggregate.markRefundPending(reason);
           updated = await this.repository.tryTransitionStatus(
             client,
             aggregate.id,
             [PaymentStatus.AUTHORIZED, PaymentStatus.CAPTURED],
             PaymentStatus.REFUND_PENDING
           );
           if (updated) {
               const pendingEvents = this._buildOutboxEvent(aggregate, correlationId, refundIdempotencyKey, traceId);
               await withSpan('Outbox Insert', async () => {
                   for(const ev of pendingEvents) {
                       await this.repository._insertOutboxEvent(client, aggregate.id, ev);
                   }
               });
           }
           await client.query('COMMIT');
         });
      } catch(err) {
         await client.query('ROLLBACK');
         client.release();
         metrics.increment('payment_refund_failed_total');
         throw err;
      }

      if (!updated) {
          client.release();
          return; // Already refunded or invalid state
      }

      aggregate.clearEvents ? aggregate.clearEvents() : aggregate.pullDomainEvents();

      const provider = paymentRecord.gateway_provider || 'mock';
      const gateway = this.gatewayRegistry.resolve(provider);
      let gatewayRes;
      try {
        await withSpan('Gateway Refund', async (gwSpan) => {
          gwSpan.setAttribute('gateway', provider);
          logger.info({ paymentId: aggregate.id, gateway: provider, reason }, 'Requesting refund from gateway');
          
          const startGw = process.hrtime.bigint();
          gatewayRes = await gateway.refund({
            paymentId: aggregate.id,
            gatewayTxId: aggregate.gatewayTxId,
            amount: aggregate.amount,
            idempotencyKey: refundIdempotencyKey,
          });
          const endGw = process.hrtime.bigint();
          metrics.observe('payment_gateway_request_duration_seconds', Number(endGw - startGw) / 1e9, { gateway: provider, operation: 'refund', status: 'success' });
        });
      } catch (err) {
        logger.error({ err: err.message, gateway: provider }, 'Failed to refund payment');
        client.release();
        metrics.increment('payment_refund_failed_total');
        // We could observe latency for failure too if we track startGw outside try block, but let's keep it simple for MVP or do it later if needed.
        return; // Stop here, leave as REFUND_PENDING
      }

      if (gatewayRes.status === 'REFUNDED') {
        try {
            await withSpan('Persist State', async (persistSpan) => {
                await client.query('BEGIN');
                aggregate.refund(reason);
                const outboxEvents = this._buildOutboxEvent(aggregate, correlationId, refundIdempotencyKey, traceId);
                
                const completed = await this.repository.tryTransitionStatus(
                  client,
                  aggregate.id,
                  PaymentStatus.REFUND_PENDING,
                  PaymentStatus.REFUNDED
                );
                if (completed) {
                    await withSpan('Outbox Insert', async () => {
                        for (const event of outboxEvents) {
                           await this.repository._insertOutboxEvent(client, aggregate.id, event);
                        }
                    });
                }
                await client.query('COMMIT');
                metrics.increment('payment_refund_success_total');
            });
        } catch(err) {
            await client.query('ROLLBACK');
            metrics.increment('payment_refund_failed_total');
        } finally {
            client.release();
        }
      } else {
          client.release();
          metrics.increment('payment_refund_failed_total');
      }
    });
  }

  _buildOutboxEvent(aggregate, correlationId, causationId, traceparent = null) {
    const domainEvents = aggregate.pullDomainEvents();
    if (domainEvents.length === 0) return [];

    const outboxEvents = [];
    for (const domainEvent of domainEvents) {
      const integrationEvent = IntegrationEventMapper.mapDomainToIntegration(domainEvent, {
        orderId: aggregate.orderId,
        traceId: causationId,
      });

      if (integrationEvent) {
        outboxEvents.push({
          eventType: integrationEvent.eventType,
          eventVersion: integrationEvent.eventVersion,
          payload: integrationEvent.payload,
          metadata: {
            traceparent: traceparent,
            correlation_id: correlationId,
            causation_id: causationId,
          },
        });
      }
    }
    return outboxEvents;
  }

  async _persistAggregateState(aggregate, correlationId, causationId, traceId, traceparent = null, trx) {
    const outboxEvents = this._buildOutboxEvent(aggregate, correlationId, causationId, traceparent);

    // Domain invariant: the DECLINED path is expected to emit at most one event.
    // Assert here so that if the aggregate ever emits more events on this path
    // we surface it immediately instead of silently dropping events.
    if (outboxEvents.length > 1) {
      throw new Error(
        `_persistAggregateState: expected at most 1 outbox event, got ${outboxEvents.length}. ` +
        `Use tryTransitionStatus with explicit outbox events for multi-event aggregates.`
      );
    }

    await this.repository.updatePaymentAfterWebhook(
      aggregate.id,
      aggregate.status,
      aggregate.gatewayTxId,
      aggregate.errorReason,
      outboxEvents[0] ?? null,
    );
  }
}
