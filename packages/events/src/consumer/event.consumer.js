/**
 * Abstract interface for Consuming events from the Message Broker.
 * Business logic should implement this interface.
 */
export class EventConsumer {
  /**
   * Identifies which event type this consumer handles.
   * Should return one of the EventTypes from EventRegistry.
   * @returns {string}
   */
  getEventType() {
    throw new Error('Method not implemented: EventConsumer.getEventType()');
  }

  /**
   * The core business logic to execute when an event is received.
   * If this method throws an error, the platform will handle Retry/DLQ automatically.
   * @param {EventEnvelope} event 
   */
  async handle(event) {
    throw new Error('Method not implemented: EventConsumer.handle()');
  }
}
