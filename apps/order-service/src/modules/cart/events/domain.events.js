export class DomainEventPublisher {
  /**
   * Publishes an event to the underlying bus
   * @param {string} eventName 
   * @param {Object} payload 
   */
  publish(eventName, payload) {
    throw new Error('Method not implemented.');
  }
}

export class MockDomainEventPublisher extends DomainEventPublisher {
  publish(eventName, payload) {
    console.log(`[DOMAIN EVENT PUBLISHED] ${eventName}:`, JSON.stringify(payload));
  }
}
