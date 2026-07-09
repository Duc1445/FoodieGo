export class InventoryBusinessConsumer {
  /**
   * @param {object} reservationRepo 
   * @param {object} idempotencyStore 
   */
  constructor(reservationRepo, idempotencyStore) {
    this.reservationRepo = reservationRepo;
    this.idempotencyStore = idempotencyStore;
  }

  async handle(event) {
    const { eventId, eventType, payload } = event;

    const alreadyProcessed = await this.idempotencyStore.isProcessed(eventId);
    if (alreadyProcessed) {
      return;
    }

    if (eventType === 'InventoryReservationRequestedV1') {
      const reservation = await this.reservationRepo.findById(payload.reservationId);
      if (reservation) {
        // Handle double request or resume
        reservation.reserve();
        await this.reservationRepo.save(reservation);
      } else {
        // In real system, we create it and reserve
      }
    } else if (eventType === 'RestaurantRejectedV1') {
      // Find reservation by orderId
      const reservation = await this.reservationRepo.findByOrderId(payload.orderId);
      if (reservation && reservation.status === 'RESERVED') {
        reservation.release();
        await this.reservationRepo.save(reservation);
      }
    }

    await this.idempotencyStore.markProcessed(eventId);
  }
}
