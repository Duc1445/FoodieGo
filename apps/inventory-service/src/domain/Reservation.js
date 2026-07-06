export const ReservationStatus = {
  CREATED: 'CREATED',
  RESERVED: 'RESERVED',
  CONFIRMED: 'CONFIRMED',
  EXPIRED: 'EXPIRED',
  RELEASED: 'RELEASED'
};

export class Reservation {
  constructor({ reservationId, orderId, status, expiresAt, items }) {
    this.reservationId = reservationId;
    this.orderId = orderId;
    this.status = status || ReservationStatus.CREATED;
    this.expiresAt = expiresAt;
    this.items = items || []; // Array of { stockItemId, quantity }
  }

  isExpired(currentTime = new Date()) {
    if (this.status !== ReservationStatus.RESERVED) return false;
    return this.expiresAt && new Date(this.expiresAt) < currentTime;
  }

  markAsReserved(ttlSeconds) {
    if (this.status !== ReservationStatus.CREATED) {
      throw new Error(`Cannot transition to RESERVED from ${this.status}`);
    }
    this.status = ReservationStatus.RESERVED;
    const now = new Date();
    this.expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
  }

  confirm() {
    if (this.status !== ReservationStatus.RESERVED) {
      throw new Error(`Cannot confirm reservation in status ${this.status}`);
    }
    this.status = ReservationStatus.CONFIRMED;
  }

  expire() {
    if (this.status !== ReservationStatus.RESERVED) {
      throw new Error(`Cannot expire reservation in status ${this.status}`);
    }
    this.status = ReservationStatus.EXPIRED;
  }

  release() {
    if (this.status !== ReservationStatus.RESERVED && this.status !== ReservationStatus.EXPIRED) {
      throw new Error(`Cannot release reservation in status ${this.status}`);
    }
    this.status = ReservationStatus.RELEASED;
  }
}
