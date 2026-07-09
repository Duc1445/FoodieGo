import pool from '../config/database.js';

import { Reservation, ReservationStatus } from '../domain/Reservation.js';

export class InventoryService {
  constructor() {
    this.repo = new InventoryRepository(pool);
  }

  /**
   * Handle OrderPendingReservation event
   */
  async handleOrderPendingReservation(payload, traceId) {
    const { orderId, items } = payload;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const reservation = new Reservation({
        orderId,
        items
      });

      const failedSkus = [];
      const ttl = parseInt(process.env.RESERVATION_TTL || '900', 10);

      // Attempt to reserve all items
      for (const item of items) {
        const stock = await this.repo.getStockBySku(item.sku, client);
        if (!stock) {
          failedSkus.push(item.sku);
          continue;
        }

        if (!stock.canReserve(item.quantity)) {
          failedSkus.push(item.sku);
          continue;
        }

        stock.reserve(item.quantity);
        
        try {
          await this.repo.updateStock(stock, client);
        } catch (error) {
          // Optimistic locking failure counts as failed reservation for this transaction
          failedSkus.push(item.sku);
        }
      }

      if (failedSkus.length > 0) {
        // Validation failed, rollback any stock updates and publish failure
        await client.query('ROLLBACK');
        await client.query('BEGIN'); // Start new transaction for outbox event
        
        await this.repo.saveOutboxEvent({
          eventType: 'InventoryReservationFailed',
          eventVersion: 1,
          aggregateType: 'Order',
          aggregateId: orderId,
          payload: { orderId, reason: 'Insufficient stock or locking conflict', failedSkus },
          metadata: { traceId }
        }, client);
        
        await client.query('COMMIT');
        return false;
      }

      // Success: save reservation and publish InventoryReserved
      reservation.markAsReserved(ttl);
      await this.repo.createReservation(reservation, client);

      await this.repo.saveOutboxEvent({
        eventType: 'InventoryReserved',
        eventVersion: 1,
        aggregateType: 'Order',
        aggregateId: orderId,
        payload: { 
          orderId, 
          reservationId: reservation.reservationId, 
          status: reservation.status, 
          expiresAt: reservation.expiresAt 
        },
        metadata: { traceId }
      }, client);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
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
