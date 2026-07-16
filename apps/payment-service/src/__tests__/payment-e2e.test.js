import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import pool from '../config/database.js';
import { RabbitMQAdapter } from '@foodiego/rabbit';
import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentDomainService } from '../domain/payment.service.js';
import { GatewayRegistry } from '../infrastructure/gateways/gateway.registry.js';
import { MockGateway } from '../infrastructure/gateways/mock.gateway.js';
import { OrderCancelledConsumer } from '../workers/consumer.worker.js';
import { startWebhookWorker } from '../workers/webhook.worker.js';
import { startReconciliationWorker } from '../workers/reconciliation.worker.js';
import crypto from 'crypto';
import { setTimeout } from 'timers/promises';

describe('Payment Service E2E Hardening Test', () => {
  let rabbitAdapter;
  let paymentRepo;
  let paymentService;
  let gatewayRegistry;
  let mockGateway;
  let receivedRefundEvents = [];
  let receivedAuthEvents = [];

  let rabbitAvailable = false;

  beforeAll(async () => {
    paymentRepo = new PaymentRepository();
    gatewayRegistry = new GatewayRegistry();
    mockGateway = new MockGateway('test-secret', paymentRepo);
    gatewayRegistry.register('mock', mockGateway);
    paymentService = new PaymentDomainService(paymentRepo, gatewayRegistry);

    try {
      rabbitAdapter = new RabbitMQAdapter(
        process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
      );
      await Promise.race([
        rabbitAdapter.connect(),
        new Promise((_, reject) =>
          setTimeout(3000).then(() => reject(new Error('RabbitMQ connection timeout'))),
        ),
      ]);
      rabbitAvailable = true;

      // Start all workers
      const orderCancelledConsumer = new OrderCancelledConsumer(paymentService);
      await rabbitAdapter.registerConsumer(orderCancelledConsumer, pool);
      // Overwrite polling interval to 500ms for test
      process.env.WEBHOOK_WORKER_POLLING_INTERVAL = '500';
      startWebhookWorker(paymentService, paymentRepo);

      // Test queue for assertions
      const testChannel = rabbitAdapter.channel;
      await testChannel.assertExchange('foodiego.payment.events', 'topic', { durable: true });
      const { queue } = await testChannel.assertQueue('', { exclusive: true });
      await testChannel.bindQueue(queue, 'foodiego.payment.events', '#');

      testChannel.consume(queue, (msg) => {
        if (msg) {
          const payload = JSON.parse(msg.content.toString());
          if (msg.fields.routingKey === 'PaymentRefunded') receivedRefundEvents.push(payload);
          if (msg.fields.routingKey === 'PaymentAuthorized') receivedAuthEvents.push(payload);
          testChannel.ack(msg);
        }
      });
    } catch (err) {
      console.log('Skipping e2e tests: RabbitMQ not available');
    }
  });

  afterAll(async () => {
    if (rabbitAvailable) {
      await rabbitAdapter.close();
    }
    await pool.end();
  });

  beforeEach(() => {
    if (!rabbitAvailable) {
      console.log('Skipping test: RabbitMQ not available');
      return;
    }
  });

  it('SCENARIO 1: Duplicate OrderCancelled -> exactly ONE PaymentRefunded', async () => {
    if (!rabbitAvailable) {
      console.log('Skipping SCENARIO 1: RabbitMQ not available');
      return;
    }
    const orderId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO payments (id, order_id, amount, currency, status, payment_method, gateway_provider, idempotency_key)
       VALUES ($1, $2, 100.00, 'USD', 'AUTHORIZED', 'CREDIT_CARD', 'mock', $3)`,
      [paymentId, orderId, `idem_${orderId}`],
    );

    const orderCancelledPayload = {
      eventId: crypto.randomUUID(),
      eventType: 'OrderCancelled',
      eventVersion: 1,
      payload: { orderId, reason: 'Test exactly once' },
    };

    const pubChannel = rabbitAdapter.channel;
    // Send 3 times simulating aggressive redelivery
    pubChannel.publish(
      'foodiego.orders.events',
      'OrderCancelled',
      Buffer.from(JSON.stringify(orderCancelledPayload)),
    );
    pubChannel.publish(
      'foodiego.orders.events',
      'OrderCancelled',
      Buffer.from(JSON.stringify(orderCancelledPayload)),
    );
    pubChannel.publish(
      'foodiego.orders.events',
      'OrderCancelled',
      Buffer.from(JSON.stringify(orderCancelledPayload)),
    );

    await setTimeout(2000);

    // Force outbox publish
    const outboxEvents = await pool.query(
      `SELECT * FROM outbox_events WHERE status = 'PENDING' AND aggregate_id = $1`,
      [paymentId],
    );
    for (const event of outboxEvents.rows) {
      const envelope = {
        eventId: event.event_id,
        eventType: event.event_type,
        eventVersion: event.event_version,
        occurredAt: event.occurred_at,
        traceId: event.metadata?.traceId,
        correlationId: event.metadata?.correlationId,
        causationId: event.metadata?.causationId,
        aggregateId: event.aggregate_id,
        aggregateType: event.aggregate_type,
        payload: event.payload,
        metadata: event.metadata,
      };
      pubChannel.publish(
        'foodiego.payment.events',
        event.event_type,
        Buffer.from(JSON.stringify(envelope)),
      );
      await pool.query(`UPDATE outbox_events SET status = 'PUBLISHED' WHERE event_id = $1`, [
        event.event_id,
      ]);
    }
    await setTimeout(500);

    const finalPayment = await pool.query(
      `SELECT status, is_refund_requested FROM payments WHERE id = $1`,
      [paymentId],
    );
    expect(finalPayment.rows[0].status).toBe('REFUNDED');
    expect(finalPayment.rows[0].is_refund_requested).toBe(true);

    const refundEventsForOrder = receivedRefundEvents.filter((e) => e.payload.orderId === orderId);
    expect(refundEventsForOrder.length).toBe(1);

    const allOutboxEvents = await pool.query(
      `SELECT * FROM outbox_events WHERE aggregate_id = $1`,
      [paymentId],
    );
    expect(allOutboxEvents.rows.length).toBe(2);
  }, 10000);

  it('SCENARIO 2: Duplicate Webhook with older sequence -> exactly ONE PaymentAuthorized', async () => {
    if (!rabbitAvailable) {
      console.log('Skipping SCENARIO 2: RabbitMQ not available');
      return;
    }
    const orderId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO payments (id, order_id, amount, currency, status, payment_method, gateway_provider, idempotency_key)
       VALUES ($1, $2, 100.00, 'USD', 'PENDING', 'CREDIT_CARD', 'mock', $3)`,
      [paymentId, orderId, `idem_${orderId}`],
    );

    // Webhook 1 (sequence 10)
    await paymentRepo.persistWebhookInbox(
      crypto.randomUUID(),
      'mock',
      'tx_1',
      'sig',
      'hash',
      {
        event: 'payment.updated',
        data: { tx_id: 'tx_1', reference: paymentId, status: 'AUTHORIZED' },
        sequence: 10,
      },
      null,
    );

    // Webhook 2 (sequence 9, older! Should be dropped)
    await paymentRepo.persistWebhookInbox(
      crypto.randomUUID(),
      'mock',
      'tx_1',
      'sig',
      'hash',
      {
        event: 'payment.updated',
        data: { tx_id: 'tx_1', reference: paymentId, status: 'AUTHORIZED' },
        sequence: 9,
      },
      null,
    );

    // Webhook 3 (duplicate sequence 10, should be dropped via idempotency)
    await paymentRepo.persistWebhookInbox(
      crypto.randomUUID(),
      'mock',
      'tx_1',
      'sig',
      'hash',
      {
        event: 'payment.updated',
        data: { tx_id: 'tx_1', reference: paymentId, status: 'AUTHORIZED' },
        sequence: 10,
      },
      null,
    );

    await setTimeout(2000); // Wait for webhook worker

    const outboxEvents = await pool.query(
      `SELECT * FROM outbox_events WHERE status = 'PENDING' AND aggregate_id = $1`,
      [paymentId],
    );
    console.log('SCENARIO 2 OUTBOX:', outboxEvents.rows);
    const pubChannel = rabbitAdapter.channel;
    for (const event of outboxEvents.rows) {
      const envelope = {
        eventId: event.event_id,
        eventType: event.event_type,
        eventVersion: event.event_version,
        occurredAt: event.occurred_at,
        traceId: event.metadata?.traceId,
        correlationId: event.metadata?.correlationId,
        causationId: event.metadata?.causationId,
        aggregateId: event.aggregate_id,
        aggregateType: event.aggregate_type,
        payload: event.payload,
        metadata: event.metadata,
      };
      pubChannel.publish(
        'foodiego.payment.events',
        event.event_type,
        Buffer.from(JSON.stringify(envelope)),
      );
      await pool.query(`UPDATE outbox_events SET status = 'PUBLISHED' WHERE event_id = $1`, [
        event.event_id,
      ]);
    }
    await setTimeout(500);

    const finalPayment = await pool.query(
      `SELECT status, gateway_sequence FROM payments WHERE id = $1`,
      [paymentId],
    );
    expect(finalPayment.rows[0].status).toBe('AUTHORIZED');
    expect(finalPayment.rows[0].gateway_sequence).toBe('10');

    const authEventsForOrder = receivedAuthEvents.filter((e) => e.payload.orderId === orderId);
    expect(authEventsForOrder.length).toBe(1);

    const allOutboxEvents = await pool.query(
      `SELECT * FROM outbox_events WHERE aggregate_id = $1`,
      [paymentId],
    );
    expect(allOutboxEvents.rows.length).toBe(1);
  }, 10000);
});
