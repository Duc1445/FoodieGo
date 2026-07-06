import { Stock } from '../domain/Stock.js';
import { Reservation, ReservationStatus } from '../domain/Reservation.js';
import { context, propagation } from '@opentelemetry/api';

export class InventoryRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async getStockBySku(sku, client = this.pool) {
    const result = await client.query(
      'SELECT stock_item_id, total_quantity, reserved_quantity, version FROM inventory_stock WHERE stock_item_id = $1',
      [sku]
    );
    if (result.rows.length === 0) return null;
    return new Stock({
      stockItemId: result.rows[0].stock_item_id,
      totalQuantity: result.rows[0].total_quantity,
      reservedQuantity: result.rows[0].reserved_quantity,
      version: result.rows[0].version
    });
  }

  /**
   * Performs an optimistic locking update on the stock table.
   * If the version does not match, throws an Error.
   */
  async updateStock(stock, client = this.pool) {
    const result = await client.query(
      `UPDATE inventory_stock 
       SET reserved_quantity = $1, total_quantity = $2, version = version + 1, updated_at = NOW() 
       WHERE stock_item_id = $3 AND version = $4
       RETURNING version`,
      [stock.reservedQuantityAmount(), stock.totalQuantityAmount(), stock.stockItemId, stock.version]
    );

    if (result.rowCount === 0) {
      throw new Error(`Optimistic locking failure for SKU ${stock.stockItemId}`);
    }
    
    // Update domain object with new version
    stock.version = result.rows[0].version;
  }

  async createReservation(reservation, client = this.pool) {
    const result = await client.query(
      `INSERT INTO inventory_reservations (order_id, status, expires_at)
       VALUES ($1, $2, $3)
       RETURNING reservation_id`,
      [reservation.orderId, reservation.status, reservation.expiresAt]
    );
    
    reservation.reservationId = result.rows[0].reservation_id;

    for (const item of reservation.items) {
      await client.query(
        `INSERT INTO inventory_reservation_items (reservation_id, stock_item_id, quantity)
         VALUES ($1, $2, $3)`,
        [reservation.reservationId, item.sku, item.quantity]
      );
    }
  }

  async updateReservationStatus(reservationId, status, client = this.pool) {
    await client.query(
      `UPDATE inventory_reservations SET status = $1, updated_at = NOW() WHERE reservation_id = $2`,
      [status, reservationId]
    );
  }

  async saveOutboxEvent(event, client = this.pool) {
    const metadata = event.metadata || {};
    // Inject W3C traceparent into metadata
    propagation.inject(context.active(), metadata);
    
    await client.query(
      `INSERT INTO outbox_events (event_type, event_version, aggregate_type, aggregate_id, payload, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        event.eventType,
        event.eventVersion || 1,
        event.aggregateType,
        event.aggregateId,
        event.payload,
        metadata
      ]
    );
  }
}
