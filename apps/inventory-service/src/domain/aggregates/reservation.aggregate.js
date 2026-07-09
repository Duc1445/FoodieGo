import { randomUUID } from 'crypto';

export class ReservationAggregate {
  /**
   * @param {string} id 
   * @param {string} orderId 
   * @param {Array<{foodId: string, variantId: string, quantity: number}>} items 
   */
  constructor(id, orderId, items) {
    this.id = id || randomUUID();
    this.orderId = orderId;
    this.items = items;
    this.status = 'REQUESTED';
    this.domainEvents = [];
    
    this.domainEvents.push({
      type: 'InventoryReservationRequested',
      payload: { reservationId: this.id, orderId: this.orderId, items: this.items, timestamp: new Date() }
    });
  }

  reserve() {
    if (this.status !== 'REQUESTED') {
      throw new Error(`Cannot transition from ${this.status} to RESERVED`);
    }
    this.status = 'RESERVED';
    this.domainEvents.push({
      type: 'InventoryReserved',
      payload: { reservationId: this.id, orderId: this.orderId, items: this.items, timestamp: new Date() }
    });
  }

  fail(reason) {
    if (this.status !== 'REQUESTED') {
      throw new Error(`Cannot transition from ${this.status} to FAILED`);
    }
    this.status = 'FAILED';
    this.domainEvents.push({
      type: 'InventoryReservationFailed',
      payload: { reservationId: this.id, orderId: this.orderId, reason, timestamp: new Date() }
    });
  }

  confirm() {
    if (this.status !== 'RESERVED') {
      throw new Error(`Cannot transition from ${this.status} to CONFIRMED`);
    }
    this.status = 'CONFIRMED';
    this.domainEvents.push({
      type: 'InventoryConfirmed',
      payload: { reservationId: this.id, orderId: this.orderId, timestamp: new Date() }
    });
  }

  release() {
    // Can only release if it was reserved
    if (this.status !== 'RESERVED') {
      throw new Error(`Cannot transition from ${this.status} to RELEASED`);
    }
    this.status = 'RELEASED';
    this.domainEvents.push({
      type: 'InventoryReleased',
      payload: { reservationId: this.id, orderId: this.orderId, items: this.items, timestamp: new Date() }
    });
  }

  expire() {
    if (this.status !== 'RESERVED') {
      throw new Error(`Cannot transition from ${this.status} to EXPIRED`);
    }
    this.status = 'EXPIRED';
    this.domainEvents.push({
      type: 'InventoryExpired',
      payload: { reservationId: this.id, orderId: this.orderId, items: this.items, timestamp: new Date() }
    });
  }
}
