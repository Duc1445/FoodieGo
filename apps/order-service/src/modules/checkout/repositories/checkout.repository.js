import pool from '../../../config/database.js';
import { InfrastructureError } from '@foodiego/core';
import crypto from 'crypto';
import { context, propagation } from '@opentelemetry/api';

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
        const payload = { ...outboxEvent.payload, orderId };

        // Inject W3C traceparent into metadata
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
            outboxEvent.eventVersion || 1, // event_version
            'Order', // aggregate_type
            orderId, // aggregate_id
            JSON.stringify(payload),
            JSON.stringify({ ...traceHeaders, traceId: outboxEvent.payload.traceId }), // metadata
          ],
        );
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

  async updateOrderStatus(orderId, status, outboxEvent = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [
        status,
        orderId,
      ]);

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
            'Order',
            orderId,
            JSON.stringify(outboxEvent.payload),
            JSON.stringify({ ...traceHeaders, traceId: outboxEvent.payload.traceId }),
          ],
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * TODO (post-demo 16/7): replace with createOrderWithOutbox + saga once Inventory Service exists.
   *
   * Synchronous version: inventory check + order creation in one transaction.
   * No outbox event emitted. Order is placed directly in CONFIRMED status.
   * Used as a demo bypass for the event-driven saga.
   */
  async createOrderWithInventoryCheck(order, orderItems, _outboxEvent) {
    const client = await pool.connect();
    try {
      const requestHash = this._generateHash({ idempotencyKey: order.idempotencyKey });

      await client.query('BEGIN');

      // 1. Idempotency Check
      const idempotencyRes = await client.query(
        `INSERT INTO idempotency_keys (key, request_hash, status, expires_at)
         VALUES ($1, $2, 'IN_PROGRESS', NOW() + INTERVAL '24 HOURS')
         ON CONFLICT (key) DO UPDATE SET key = EXCLUDED.key
         RETURNING request_hash, status, response`,
        [order.idempotencyKey, requestHash],
      );

      const keyRecord = idempotencyRes.rows[0];

      if (keyRecord.status === 'COMPLETED') {
        await client.query('ROLLBACK');
        return keyRecord.response.orderId;
      }

      if (keyRecord.status === 'IN_PROGRESS' && idempotencyRes.command !== 'INSERT') {
        await client.query('ROLLBACK');
        throw new Error('Request is currently processing');
      }

      // 2. Synchronous inventory check (per item, FOR UPDATE lock)
      //    Skip items that have no inventory record (unlimited stock assumed).
      //    TODO (post-demo 16/7): enforce strict inventory once stock data is seeded.
      for (const item of orderItems) {
        const stockRes = await client.query(
          `SELECT stock_item_id, total_quantity, reserved_quantity, version
           FROM inventory_stock
           WHERE stock_item_id = $1
           FOR UPDATE`,
          [item.menuItemId],
        );

        if (stockRes.rows.length === 0) {
          // No stock record → treat as unlimited; skip check
          continue;
        }

        const stock = stockRes.rows[0];
        const available = stock.total_quantity - stock.reserved_quantity;

        if (available < item.quantity) {
          throw new Error(`STOCK_INSUFFICIENT:${item.itemName}:${available}:${item.quantity}`);
        }

        // Reserve stock with optimistic locking
        const updateRes = await client.query(
          `UPDATE inventory_stock
           SET reserved_quantity = reserved_quantity + $1,
               version = version + 1,
               updated_at = NOW()
           WHERE stock_item_id = $2 AND version = $3
           RETURNING version`,
          [item.quantity, item.menuItemId, stock.version],
        );

        if (updateRes.rowCount === 0) {
          throw new Error(`STOCK_CONFLICT:${item.itemName}`);
        }
      }

      // 3. Insert Order
      const orderRes = await client.query(
        `INSERT INTO orders (
           user_id, restaurant_id, status, subtotal, delivery_fee, tax, discount,
           total, currency, payment_method, address_id, idempotency_key
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          order.userId,
          order.restaurantId,
          order.status,
          order.subtotal,
          order.deliveryFee,
          order.tax,
          order.discount,
          order.total,
          order.currency || 'VND',
          order.paymentMethod,
          order.addressId,
          order.idempotencyKey,
        ],
      );
      const orderId = orderRes.rows[0].id;

      // 4. Insert Order Items (Immutable Snapshots)
      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          await client.query(
            `INSERT INTO order_items (
               order_id, menu_item_id, quantity, item_name, item_price, price_version
             ) VALUES ($1, $2, $3, $4, $5, $6)`,
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

      // 5. Update Idempotency Key to COMPLETED
      await client.query(
        `UPDATE idempotency_keys SET status = 'COMPLETED', response = $1 WHERE key = $2`,
        [JSON.stringify({ orderId }), order.idempotencyKey],
      );

      await client.query('COMMIT');
      return orderId;
    } catch (err) {
      await client.query('ROLLBACK');

      // Parse structured stock error for user-friendly message
      if (err.message?.startsWith('STOCK_INSUFFICIENT:')) {
        const [, itemName, available, requested] = err.message.split(':');
        throw new Error(
          `Item "${itemName}" is out of stock (available: ${available}, requested: ${requested})`,
        );
      }
      if (err.message?.startsWith('STOCK_CONFLICT:')) {
        const [, itemName] = err.message.split(':');
        throw new Error(`Inventory conflict for "${itemName}". Please retry.`);
      }

      // Mark idempotency key as FAILED so it can be retried
      try {
        const client2 = await pool.connect();
        await client2.query(`UPDATE idempotency_keys SET status = 'FAILED' WHERE key = $1`, [
          order.idempotencyKey,
        ]);
        client2.release();
      } catch (_e) {
        /* ignore cleanup error */
      }

      throw new InfrastructureError(`Checkout transaction failed: ${err.message}`);
    } finally {
      client.release();
    }
  }
}
