import pool from '../config/database.js';
import { logger } from '../config/logger.js';
import { context, propagation } from '@opentelemetry/api';

/**
 * Saga Timeout Worker
 * Polls for PENDING orders older than 30 minutes and automatically cancels them.
 * Emits compensating transactions.
 */
export async function runTimeoutSweep() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Atomic UPDATE ... RETURNING to avoid race conditions with consumers
    const timeoutResult = await client.query(`
      UPDATE orders 
      SET status = 'EXPIRED', updated_at = NOW()
      WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '30 MINUTES'
      RETURNING id, is_payment_authorized, is_inventory_reserved, idempotency_key
    `);

    const timedOutOrders = timeoutResult.rows;

    if (timedOutOrders.length > 0) {
      logger.info({ count: timedOutOrders.length }, 'Saga Timeout Worker found stalled orders');
    }

    for (const order of timedOutOrders) {
      const orderId = order.id;
      const reason = 'SYSTEM_TIMEOUT';

      // 2. Trace Context Injection
      const traceHeaders = {};
      propagation.inject(context.active(), traceHeaders);
      const metadata = {
        causationId: 'timeout-worker-' + Date.now(),
        correlationId: orderId,
        ...traceHeaders,
      };

      // 3. Emit Compensations for completed branches
      if (order.is_inventory_reserved) {
        await insertOutbox(client, 'ReleaseInventoryCommand', { orderId, reason }, metadata);
      }

      if (order.is_payment_authorized) {
        await insertOutbox(client, 'RefundPaymentCommand', { orderId, reason }, metadata);
      }

      // Always emit OrderCancelled
      await insertOutbox(client, 'OrderCancelled', { orderId, reason }, metadata);

      logger.info({ orderId, reason }, 'Order timed out and compensations emitted');
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Failed to run Saga Timeout Sweep:', err);
  } finally {
    client.release();
  }
}

async function insertOutbox(trx, eventType, payload, metadata) {
  await trx.query(
    `
    INSERT INTO outbox_events (
      event_type, event_version, aggregate_type, aggregate_id, payload, metadata, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
    `,
    [eventType, 1, 'Order', payload.orderId, JSON.stringify(payload), JSON.stringify(metadata)],
  );
}
