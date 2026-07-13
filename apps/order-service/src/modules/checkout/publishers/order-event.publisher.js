import { EventPublisher } from '@foodiego/contracts';
import { context, propagation } from '@opentelemetry/api';

export class OrderEventPublisher extends EventPublisher {
  /**
   * Implements the base insertOutbox method
   * @param {object} outboxRecord The prepared record
   * @param {object} transaction The pg client
   */
  async insertOutbox(outboxRecord, transaction) {
    // Inject OpenTelemetry tracing into metadata
    const traceHeaders = {};
    propagation.inject(context.active(), traceHeaders);
    
    const parsedPayload = JSON.parse(outboxRecord.payload);

    const metadata = {
      ...traceHeaders,
      traceId: parsedPayload.traceId,
      correlationId: outboxRecord.aggregateId // Or from parsedPayload.correlationId
    };

    await transaction.query(
      `
      INSERT INTO outbox_events (
        event_type, event_version, aggregate_type, aggregate_id, payload, metadata, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
      `,
      [
        outboxRecord.eventType,
        1, // event_version
        outboxRecord.aggregateType,
        outboxRecord.aggregateId,
        outboxRecord.payload,
        JSON.stringify(metadata)
      ]
    );
  }
}
