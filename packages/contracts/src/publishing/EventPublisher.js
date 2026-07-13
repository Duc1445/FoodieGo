import { eventValidator } from './EventValidator.js';
import { InfrastructureError } from '../errors.js';

/**
 * Interface/Base class for EventPublishing
 * Individual services will implement the abstract method `insertOutbox`
 */
export class EventPublisher {
  /**
   * Defines the standard Publishing Pipeline
   * Build -> Validate -> Serialize -> Insert Outbox
   * @param {object} event The standardized event created by EventFactory
   * @param {object} transaction The database transaction context (e.g. Knex/Sequelize tx)
   * @param {object} logger The structured logger instance
   */
  async publish(event, transaction, logger) {
    try {
      // 1. Validate
      eventValidator.validate(event);

      // 2. Structured Logging
      logger.info('Publishing Event to Outbox', {
        eventId: event.eventId,
        correlationId: event.correlationId,
        eventType: event.eventType,
        schemaVersion: event.schemaVersion,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId
      });

      // 3. Serialize
      const serializedEvent = JSON.stringify(event);

      // 4. Insert into Outbox (Implemented by Subclass)
      await this.insertOutbox({
        eventId: event.eventId,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: serializedEvent,
        createdAt: new Date()
      }, transaction);

    } catch (err) {
      if (err.name === 'SchemaValidationError') {
        logger.error('Event Validation Failed', {
          eventId: event.eventId,
          eventType: event.eventType,
          errors: err.errors
        });
        throw err; // Rollback transaction
      }
      
      throw new InfrastructureError('Failed to publish event to outbox', err);
    }
  }

  /**
   * Abstract method to be implemented by specific service publishers
   * @param {object} outboxRecord 
   * @param {object} transaction 
   */
  async insertOutbox(outboxRecord, transaction) {
    throw new Error('Method "insertOutbox" must be implemented by concrete Publisher');
  }
}
