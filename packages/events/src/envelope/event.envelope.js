/**
 * Standard Event Envelope for all FoodieGo events.
 * Provides a consistent structure across the entire distributed system.
 */
export class EventEnvelope {
  constructor({ id, type, version = 1, occurredAt, traceId, aggregate, payload, metadata = {} }) {
    if (!id || !type || !aggregate || !aggregate.type || !aggregate.id || !payload) {
      throw new Error("Missing required fields in EventEnvelope");
    }

    this.id = id;
    this.type = type;
    this.version = version;
    this.occurredAt = occurredAt || new Date().toISOString();
    this.traceId = traceId || 'unknown';
    
    this.aggregate = {
      type: aggregate.type,
      id: aggregate.id
    };
    
    this.payload = payload;
    this.metadata = metadata;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      version: this.version,
      occurredAt: this.occurredAt,
      traceId: this.traceId,
      aggregate: this.aggregate,
      payload: this.payload,
      metadata: this.metadata
    };
  }
}
