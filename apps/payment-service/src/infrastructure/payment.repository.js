import pool from '../config/database.js';
import { InfrastructureError } from '@foodiego/core';
import { context, propagation } from '@opentelemetry/api';

export class PaymentRepository {
  /**
   * Creates a new payment record idempotently based on idempotency_key.
   * Also allows optionally saving an outbox event.
   */
  async createPayment(paymentData, outboxEvent = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertRes = await client.query(
        `
        INSERT INTO payments (
          order_id, amount, currency, status, payment_method, gateway_provider, idempotency_key
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id
      `,
        [
          paymentData.orderId,
          paymentData.amount,
          paymentData.currency || 'USD',
          paymentData.status || 'PENDING',
          paymentData.paymentMethod,
          paymentData.gatewayProvider || 'mock',
          paymentData.idempotencyKey,
        ],
      );

      const isNew = insertRes.rowCount > 0;
      let paymentId = isNew ? insertRes.rows[0].id : null;

      if (!isNew) {
        // Fetch existing payment ID
        const existing = await client.query(`SELECT id FROM payments WHERE idempotency_key = $1`, [
          paymentData.idempotencyKey,
        ]);
        paymentId = existing.rows[0].id;
      }

      if (isNew && outboxEvent) {
        const traceHeaders = {};
        propagation.inject(context.active(), traceHeaders);

        await client.query(
          `
          INSERT INTO outbox_events (
            event_type, event_version, aggregate_type, aggregate_id, payload, metadata, status
          ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
        `,
          [
            outboxEvent.eventType,
            outboxEvent.eventVersion || 1,
            'Payment',
            paymentId,
            JSON.stringify(outboxEvent.payload),
            JSON.stringify({ ...traceHeaders, traceId: outboxEvent.payload.traceId }),
          ],
        );
      }

      await client.query('COMMIT');
      return { paymentId, isNew };
    } catch (err) {
      await client.query('ROLLBACK');
      throw new InfrastructureError(
        `Database transaction failed during createPayment: ${err.message}`,
      );
    } finally {
      client.release();
    }
  }

  async updatePaymentStatus(
    paymentId,
    status,
    gatewayTxId = null,
    errorReason = null,
    outboxEvent = null,
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `
        UPDATE payments 
        SET status = $1, gateway_tx_id = COALESCE($2, gateway_tx_id), error_reason = COALESCE($3, error_reason), updated_at = NOW() 
        WHERE id = $4
      `,
        [status, gatewayTxId, errorReason, paymentId],
      );

      if (outboxEvent) {
        const traceHeaders = {};
        propagation.inject(context.active(), traceHeaders);

        await client.query(
          `
          INSERT INTO outbox_events (
            event_type, event_version, aggregate_type, aggregate_id, payload, metadata, status
          ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
        `,
          [
            outboxEvent.eventType,
            outboxEvent.eventVersion || 1,
            'Payment',
            paymentId,
            JSON.stringify(outboxEvent.payload),
            JSON.stringify({ ...traceHeaders, traceId: outboxEvent.payload.traceId }),
          ],
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw new InfrastructureError(
        `Database transaction failed during updatePaymentStatus: ${err.message}`,
      );
    } finally {
      client.release();
    }
  }

  async persistWebhookInbox(
    eventId,
    provider,
    providerEventId,
    signature,
    payloadHash,
    payload,
    traceparent,
  ) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `INSERT INTO webhook_inbox (event_id, provider, provider_event_id, signature, payload_hash, payload, traceparent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (event_id) DO NOTHING
         RETURNING id`,
        [eventId, provider, providerEventId, signature, payloadHash, payload, traceparent],
      );
      return res.rowCount > 0;
    } finally {
      client.release();
    }
  }

  async getPendingWebhooks() {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT * FROM webhook_inbox WHERE status = 'PENDING' ORDER BY received_at ASC LIMIT 100`,
      );
      return res.rows;
    } finally {
      client.release();
    }
  }

  async markWebhookProcessed(eventId) {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE webhook_inbox SET status = 'PROCESSED', processed_at = NOW() WHERE event_id = $1`,
        [eventId],
      );
    } finally {
      client.release();
    }
  }

  async createMockGatewayJob(paymentId, scenario, executeAfter) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO mock_gateway_jobs (payment_id, scenario, execute_after, status) VALUES ($1, $2, $3, 'PENDING')`,
        [paymentId, scenario, executeAfter],
      );
    } finally {
      client.release();
    }
  }

  async updatePaymentAfterWebhook(
    paymentId,
    status,
    providerTransactionId,
    errorReason,
    outboxEvent,
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `
        UPDATE payments 
        SET status = $1, provider_transaction_id = COALESCE($2, provider_transaction_id), error_reason = COALESCE($3, error_reason), updated_at = NOW() 
        WHERE id = $4
      `,
        [status, providerTransactionId, errorReason, paymentId],
      );

      if (outboxEvent) {
        const traceHeaders = {};
        propagation.inject(context.active(), traceHeaders);

        if (outboxEvent.metadata && outboxEvent.metadata.traceparent) {
          traceHeaders.traceparent = outboxEvent.metadata.traceparent;
        }

        await client.query(
          `
          INSERT INTO outbox_events (
            event_type, event_version, aggregate_type, aggregate_id, payload, metadata, status
          ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
        `,
          [
            outboxEvent.eventType,
            outboxEvent.eventVersion || 1,
            'Payment',
            paymentId,
            JSON.stringify(outboxEvent.payload),
            JSON.stringify({ ...traceHeaders, traceId: outboxEvent.payload.traceId }),
          ],
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw new InfrastructureError(
        `Database transaction failed during updatePaymentAfterWebhook: ${err.message}`,
      );
    } finally {
      client.release();
    }
  }

  async getPaymentByOrderId(orderId) {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async getPaymentById(paymentId) {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
      return res.rows[0];
    } finally {
      client.release();
    }
  }
}
