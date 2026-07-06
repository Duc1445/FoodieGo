import pool from '../config/database.js';
import { logger, metrics } from '../index.js';
import { ReservationStatus } from '../domain/Reservation.js';

export function startExpirationWorker() {
  const pollInterval = 5000; // Check every 5 seconds

  setInterval(async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Guardrail 3: SELECT ... FOR UPDATE SKIP LOCKED
      // Find one expired reservation and lock it
      const result = await client.query(`
        SELECT reservation_id, order_id 
        FROM inventory_reservations 
        WHERE status = $1 AND expires_at < NOW() 
        LIMIT 1 
        FOR UPDATE SKIP LOCKED
      `, [ReservationStatus.RESERVED]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return;
      }

      const { reservation_id, order_id } = result.rows[0];
      
      // Get all items in the reservation
      const itemsResult = await client.query(`
        SELECT stock_item_id, quantity 
        FROM inventory_reservation_items 
        WHERE reservation_id = $1
      `, [reservation_id]);

      // Release stock
      for (const item of itemsResult.rows) {
        await client.query(`
          UPDATE inventory_stock 
          SET reserved_quantity = reserved_quantity - $1, version = version + 1, updated_at = NOW() 
          WHERE stock_item_id = $2
        `, [item.quantity, item.stock_item_id]);
      }

      // Update reservation status
      await client.query(`
        UPDATE inventory_reservations 
        SET status = $1, updated_at = NOW() 
        WHERE reservation_id = $2
      `, [ReservationStatus.EXPIRED, reservation_id]);

      // Publish InventoryReleased event to outbox
      await client.query(`
        INSERT INTO outbox_events (event_type, event_version, aggregate_type, aggregate_id, payload)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'InventoryReleased',
        1,
        'Order',
        order_id,
        { orderId: order_id, reservationId: reservation_id, reason: 'EXPIRED' }
      ]);

      await client.query('COMMIT');
      
      // Update custom metrics
      metrics.registry.getSingleMetric('inventory_expired_total').inc();
      metrics.registry.getSingleMetric('inventory_release_total').inc();
      
      logger.info({ reservationId: reservation_id }, 'Successfully expired and released reservation');

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({ err: error }, 'Error in expiration worker');
    } finally {
      client.release();
    }
  }, pollInterval);

  logger.info('Expiration Worker started');
}
