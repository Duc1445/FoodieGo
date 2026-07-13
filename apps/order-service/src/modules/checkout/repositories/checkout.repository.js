import pool from '../../../config/database.js';
import { InfrastructureError } from '@foodiego/core';
import crypto from 'crypto';
import { context, propagation } from '@opentelemetry/api';
import { EventFactory } from '@foodiego/contracts';
import { OrderEventPublisher } from '../publishers/order-event.publisher.js';
import { logger } from '../../../config/logger.js';

const publisher = new OrderEventPublisher();

export class CheckoutRepository {
  /**
   * Generates a request hash to check for payload changes on retry
   */
  _generateHash(payload) {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  /**
   * Saves an order and outbox events in a single transaction with Idempotency
   */
  async createOrderWithOutbox(order, orderItems, outboxEvent, rawPayload) {
    const client = await pool.connect();
    try {
      const requestHash = this._generateHash(rawPayload);

      await client.query('BEGIN');

      // 1. Idempotency Check (Locking the key)
      const idempotencyRes = await client.query(
        `
        INSERT INTO idempotency_keys (key, request_hash, status, expires_at)
        VALUES ($1, $2, 'IN_PROGRESS', NOW() + INTERVAL '24 HOURS')
        ON CONFLICT (key) DO UPDATE SET key = EXCLUDED.key 
        RETURNING request_hash, status, response;
      `,
        [order.idempotencyKey, requestHash],
      );

      const keyRecord = idempotencyRes.rows[0];

      if (keyRecord.status === 'COMPLETED') {
        if (keyRecord.request_hash !== requestHash) {
          throw new Error('Idempotency key already used with a different payload');
        }
        await client.query('ROLLBACK');
        return keyRecord.response.orderId;
      }

      if (keyRecord.status === 'IN_PROGRESS' && idempotencyRes.command !== 'INSERT') {
        // Another request is currently processing this
        await client.query('ROLLBACK');
        throw new Error('Request is currently processing');
      }

      // 2. Insert Order
      const insertOrderQuery = `
        INSERT INTO orders (
          user_id, restaurant_id, status, subtotal, delivery_fee, tax, discount, total, currency, payment_method, address_id, idempotency_key
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id;
      `;
      const orderRes = await client.query(insertOrderQuery, [
        order.userId,
        order.restaurantId,
        order.status,
        order.subtotal,
        order.deliveryFee,
        order.tax,
        order.discount,
        order.total,
        order.currency || 'USD',
        order.paymentMethod,
        order.addressId,
        order.idempotencyKey,
      ]);
      const orderId = orderRes.rows[0].id;

      // 3. Insert Order Items (Immutable Snapshots)
      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          await client.query(
            `
            INSERT INTO order_items (
              order_id, menu_item_id, quantity, item_name, item_price, price_version
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `,
            [
              orderId,
              item.menuItemId,
              item.quantity,
              item.itemName,
              item.itemPrice,
              item.priceVersion,
            ],
          );
        }
      }

      // 4. Insert Outbox Event with Full Metadata
      if (outboxEvent) {
        // Build standardize event via Factory
        const event = EventFactory.create(
          outboxEvent.eventType,
          'Order', // aggregateType
          orderId, // aggregateId
          outboxEvent.payload,
          outboxEvent.correlationId || orderId,
          outboxEvent.payload.traceId // traceId
        );

        // This executes: Validation -> Logging -> Serialization -> DB Tx Insert
        await publisher.publish(event, client, logger);
      }

      // 5. Update Idempotency Key
      await client.query(
        `
        UPDATE idempotency_keys 
        SET status = 'COMPLETED', response = $1
        WHERE key = $2
      `,
        [JSON.stringify({ orderId }), order.idempotencyKey],
      );

      await client.query('COMMIT');
      return orderId;
    } catch (err) {
      await client.query('ROLLBACK');

      // Update Idempotency Key on Failure if it was locked by this transaction
      if (
        err.message !== 'Request is currently processing' &&
        err.message !== 'Idempotency key already used with a different payload'
      ) {
        // Optionally log the failure, but we let the caller handle it.
        // A failed request could technically allow the key to be retried by updating to FAILED.
        try {
          const client2 = await pool.connect();
          await client2.query(`UPDATE idempotency_keys SET status = 'FAILED' WHERE key = $1`, [
            order.idempotencyKey,
          ]);
          client2.release();
        } catch (e) {
          /* ignore cleanup error */
        }
      }

      throw new InfrastructureError(`Database transaction failed during checkout: ${err.message}`);
    } finally {
      client.release();
    }
  }

  async getOrderById(orderId) {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(orderId, status, outboxEvent = null, trx = null) {
    const client = trx || await pool.connect();
    try {
      if (!trx) await client.query('BEGIN');
      await client.query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [
        status,
        orderId,
      ]);

      if (outboxEvent) {
        // Build standardize event via Factory
        const event = EventFactory.create(
          outboxEvent.eventType,
          'Order', // aggregateType
          orderId, // aggregateId
          outboxEvent.payload,
          outboxEvent.correlationId || orderId,
          outboxEvent.traceId
        );

        // This executes: Validation -> Logging -> Serialization -> DB Tx Insert
        await publisher.publish(event, client, logger);
      }

      if (!trx) await client.query('COMMIT');
    } catch (err) {
      if (!trx) await client.query('ROLLBACK');
      throw new InfrastructureError(`Failed to update order status: ${err.message}`);
    } finally {
      if (!trx) client.release();
    }
  }

}
