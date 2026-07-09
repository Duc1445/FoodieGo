import { logger } from '../../context.js';
import { FoodAvailabilityProjection } from '../projections/food-availability.projection.js';

export class AvailabilityProjectionConsumer {
  /**
   * @param {object} repository 
   * @param {object} idempotencyStore 
   */
  constructor(repository, idempotencyStore) {
    this.repository = repository;
    this.idempotencyStore = idempotencyStore;
  }

  async handle(event) {
    const { eventId, eventType, payload, aggregateVersion } = event;

    const alreadyProcessed = await this.idempotencyStore.isProcessed(eventId);
    if (alreadyProcessed) {
      logger.info({ eventId, eventType }, 'Availability Event already processed, skipping');
      return;
    }

    let updated = false;

    // For inventory events, aggregateId might be the reservationId, 
    // but the payload contains items with foodId.
    // In our simplified projection, we process per foodId.
    const items = payload.items || [];
    for (const item of items) {
      const foodId = item.foodId;
      
      let projectionData = await this.repository.findById(foodId);
      let projection = projectionData 
        ? new FoodAvailabilityProjection(foodId)
        : new FoodAvailabilityProjection(foodId);
        
      if (projectionData) {
        Object.assign(projection, projectionData);
      }

      switch (eventType) {
        case 'InventoryReservedV1':
        case 'InventoryReleasedV1':
        case 'InventoryExpiredV1':
        case 'InventoryConfirmedV1':
          // Update availability based on event type
          // If reserved, assume it's still available if there is remaining stock, but since we don't hold stock,
          // we might just update the inventoryStatus.
          updated = projection.update({
            inventoryStatus: eventType === 'InventoryReservedV1' ? 'IN_STOCK' : projection.inventoryStatus
          }, aggregateVersion || Date.now()); // Fallback to timestamp if no aggregate version provided for multi-entity
          break;
        case 'InventoryReservationFailedV1':
          if (payload.reason === 'OUT_OF_STOCK') {
            updated = projection.update({
              isAvailable: false,
              inventoryStatus: 'OUT_OF_STOCK'
            }, aggregateVersion || Date.now());
          }
          break;
      }

      if (updated) {
        await this.repository.save(projection);
      }
    }

    await this.idempotencyStore.markProcessed(eventId);
    logger.info({ eventId, eventType }, 'Availability Projection updated successfully');
  }
}
