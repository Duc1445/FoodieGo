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
          order_id, amount, currency, status, payment_method, idempotency_key
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id
      `,
        [
          paymentData.orderId,
          paymentData.amount,
          paymentData.currency || 'USD',
          paymentData.status || 'PENDING',
          paymentData.paymentMethod,
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

  async getPaymentByOrderId(orderId) {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
      return res.rows[0];
    } finally {
      client.release();
    }
  }
}
