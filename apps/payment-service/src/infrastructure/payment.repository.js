import pool from '../config/database.js';
import { InfrastructureError } from '@foodiego/core';
import { context, propagation } from '@opentelemetry/api';

export class PaymentRepository {
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
        [paymentData.orderId, paymentData.amount, paymentData.currency || 'USD', paymentData.status || 'PENDING', paymentData.paymentMethod, paymentData.gatewayProvider || 'mock', paymentData.idempotencyKey]
      );
      
      const isNew = insertRes.rowCount > 0;
      let paymentId = isNew ? insertRes.rows[0].id : null;

      if (!isNew) {
        const existing = await client.query(`SELECT id FROM payments WHERE idempotency_key = $1`, [paymentData.idempotencyKey]);
        paymentId = existing.rows[0].id;
      }

      if (isNew && outboxEvent) {
        await this._insertOutboxEvent(client, paymentId, outboxEvent);
      }

      await client.query('COMMIT');
      return { paymentId, isNew };
    } catch (err) {
      await client.query('ROLLBACK');
      throw new InfrastructureError(`Database transaction failed during createPayment: ${err.message}`);
    } finally {
      client.release();
    }
  }

  async tryTransitionStatus(trx, paymentId, expectedStatus, newStatus, updates = {}, outboxEvent = null) {
    const { providerTransactionId, errorReason, gatewaySequence } = updates;
    const result = await trx.query(
      `
      UPDATE payments 
      SET status = $1, 
          provider_transaction_id = COALESCE($2, provider_transaction_id), 
          error_reason = COALESCE($3, error_reason), 
          gateway_sequence = COALESCE($4, gateway_sequence),
          updated_at = NOW() 
      WHERE id = $5 
        AND status = ANY($6::varchar[])
        AND (
            $4::bigint IS NULL OR
            gateway_sequence IS NULL OR
            gateway_sequence < $4::bigint
        )
      RETURNING *
      `,
      [newStatus, providerTransactionId || null, errorReason || null, gatewaySequence || null, paymentId, Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus]]
    );

    if (result.rowCount > 0 && outboxEvent) {
      const events = Array.isArray(outboxEvent) ? outboxEvent : [outboxEvent];
      for (const evt of events) {
        await this._insertOutboxEvent(trx, paymentId, evt);
      }
    }
    
    return result.rowCount > 0 ? result.rows[0] : null;
  }

  async tryLockForRefund(trx, orderId) {
    // If it's already REFUNDED or REFUND_PENDING, we don't lock it. We just return null so it returns early idempotently.
    // wait, we also don't lock it if is_refund_requested is true.
    const res = await trx.query(
      `
      UPDATE payments 
      SET is_refund_requested = true, updated_at = NOW() 
      WHERE order_id = $1 
        AND is_refund_requested = false 
        AND status NOT IN ('REFUNDED', 'REFUND_PENDING')
      RETURNING *
      `,
      [orderId]
    );
    return res.rowCount > 0 ? res.rows[0] : null;
  }
  
  async updatePaymentStatus(paymentId, status, gatewayTxId = null, errorReason = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE payments SET status = $1, gateway_tx_id = COALESCE($2, gateway_tx_id), error_reason = COALESCE($3, error_reason), updated_at = NOW() WHERE id = $4`,
        [status, gatewayTxId, errorReason, paymentId]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getPaymentByIdForUpdate(trx, paymentId) {
    const res = await trx.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [paymentId]);
    return res.rows[0];
  }

  async getPaymentByOrderId(orderId) {
    const res = await pool.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
    return res.rows[0];
  }

  async getPaymentById(paymentId) {
    const res = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    return res.rows[0];
  }

  async persistWebhookInbox(eventId, provider, providerEventId, signature, payloadHash, payload, traceparent) {
    const res = await pool.query(
      `INSERT INTO webhook_inbox (event_id, provider, provider_event_id, signature, payload_hash, payload, traceparent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING id`,
      [eventId, provider, providerEventId, signature, payloadHash, payload, traceparent]
    );
    return res.rowCount > 0;
  }

  async getPendingWebhooks() {
    const res = await pool.query(`SELECT * FROM webhook_inbox WHERE status = 'PENDING' ORDER BY received_at ASC LIMIT 100`);
    return res.rows;
  }

  async markWebhookProcessed(trx, eventId) {
    await trx.query(`UPDATE webhook_inbox SET status = 'PROCESSED', processed_at = NOW() WHERE event_id = $1`, [eventId]);
  }

  async createMockGatewayJob(paymentId, scenario, executeAfter) {
    await pool.query(
      `INSERT INTO mock_gateway_jobs (payment_id, scenario, execute_after, status) VALUES ($1, $2, $3, 'PENDING')`,
      [paymentId, scenario, executeAfter]
    );
  }

  async _insertOutboxEvent(trx, paymentId, outboxEvent) {
    const traceHeaders = {};
    propagation.inject(context.active(), traceHeaders);
    if (outboxEvent.metadata && outboxEvent.metadata.traceparent) {
      traceHeaders.traceparent = outboxEvent.metadata.traceparent;
    }
    await trx.query(
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
      ]
    );
  }
}
