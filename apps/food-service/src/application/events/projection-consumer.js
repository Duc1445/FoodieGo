import { logger } from '../../context.js';

export class ProjectionConsumer {
  /**
   * @param {import('./food-projection.builder.js').FoodProjectionBuilder} builder 
   * @param {object} idempotencyStore 
   */
  constructor(builder, idempotencyStore) {
    this.builder = builder;
    this.idempotencyStore = idempotencyStore;
  }

  async handle(event) {
    const { eventId, eventType } = event;

    // 1. Idempotency Check
    const alreadyProcessed = await this.idempotencyStore.isProcessed(eventId);
    if (alreadyProcessed) {
      logger.info({ eventId, eventType }, 'Event already processed, skipping (Idempotency)');
      return;
    }

    try {
      // 2. Delegate to Builder
      await this.builder.build(event);
      
      // 3. Mark as processed
      await this.idempotencyStore.markProcessed(eventId);
      logger.info({ eventId, eventType }, 'Projection updated successfully');
    } catch (err) {
      logger.error({ eventId, eventType, err: err.message }, 'Failed to process projection update');
      throw err; // Trigger retry
    }
  }
}
