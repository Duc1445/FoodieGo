/**
 * Abstract interface for Publishing events to the Message Broker.
 * Business logic should ONLY depend on this interface, not the concrete implementation (e.g., RabbitMQPublisher).
 */
export class EventPublisher {
  /**
   * Publishes an EventEnvelope to the message broker.
   * @param {EventEnvelope} event 
   */
  async publish(event) {
    throw new Error('Method not implemented: EventPublisher.publish()');
  }

  /**
   * Publishes a batch of events (useful for the Outbox Dispatcher).
   * @param {Array<EventEnvelope>} events 
   */
  async publishBatch(events) {
    throw new Error('Method not implemented: EventPublisher.publishBatch()');
  }
}
