import pool from '../config/database.js';

import { Reservation, ReservationStatus } from '../domain/Reservation.js';
import { InventoryRepository } from '../infrastructure/InventoryRepository.js';

export class InventoryService {
  constructor() {
    this.repo = new InventoryRepository(pool);
  }

  /**
   * Handle OrderPendingReservation event
   */
  async handleOrderPendingReservation(payload, correlationId, traceId) {
    const { orderId, items } = payload;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const mappedItems = items.map(item => ({
        sku: item.menuItemId,
        quantity: item.quantity
      }));

      const reservation = new Reservation({
        orderId,
        items: mappedItems,
      });

      const ttl = parseInt(process.env.RESERVATION_TTL || '900', 10);
      reservation.markAsReserved(ttl);

      // Perform real inventory deduction with optimistic locking
      for (const item of mappedItems) {
        const stock = await this.repo.getStockBySku(item.sku, client);
        if (!stock) {
          throw new Error(`Stock not found for SKU ${item.sku}`);
        }
        stock.reserve(item.quantity); // Throws if insufficient stock
        await this.repo.updateStock(stock, client); // Throws if optimistic lock fails
      }

      await this.repo.createReservation(reservation, client);

      await this.repo.saveOutboxEvent(
        {
          eventType: 'InventoryReserved',
          eventVersion: 1,
          aggregateType: 'Order',
          aggregateId: orderId,
          payload: {
            orderId,
            reservationId: reservation.reservationId,
            status: reservation.status,
            expiresAt: reservation.expiresAt,
          },
          metadata: { traceId, correlationId },
        },
        client,
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      
      // If business rule violation (e.g. out of stock), we should publish InventoryReservationFailed
      // and NOT throw so that the event is ACKed.
      const isBusinessViolation = error.message.includes('Insufficient stock') || error.message.includes('Stock not found');
      if (isBusinessViolation) {
        const failClient = await pool.connect();
        try {
          await failClient.query('BEGIN');
          await this.repo.saveOutboxEvent(
            {
              eventType: 'InventoryReservationFailed',
              eventVersion: 1,
              aggregateType: 'Order',
              aggregateId: orderId,
              payload: {
                orderId,
                reason: error.message
              },
              metadata: { traceId, correlationId },
            },
            failClient,
          );
          await failClient.query('COMMIT');
          return true; // Successfully handled the failure via compensation event
        } catch (failErr) {
          await failClient.query('ROLLBACK');
          throw failErr;
        } finally {
          failClient.release();
        }
      }
      
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * We will add handlePaymentCompleted and handlePaymentFailed in subsequent steps if needed
   * (Currently Guardrail 9 says: prepare contracts only, don't implement Payment).
   */
}
