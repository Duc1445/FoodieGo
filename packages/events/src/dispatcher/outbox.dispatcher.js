import { EventPublisher } from '../publisher/event.publisher.js';
import { context, propagation, trace } from '@opentelemetry/api';

export class OutboxDispatcher {
  /**
   * @param {Object} pool - Postgres connection pool
   * @param {EventPublisher} publisher - Broker adapter (e.g., RabbitMQAdapter)
   * @param {Object} options - Configuration options
   */
  constructor(pool, publisher, options = {}) {
    this.pool = pool;
    this.publisher = publisher;

    this.batchSize = options.batchSize || 50;
    this.pollIntervalIdle = options.pollIntervalIdle || 2000;
    this.pollIntervalActive = options.pollIntervalActive || 100;
    this.workerId =
      options.workerId || `dispatcher-${process.pid}-${Math.random().toString(36).substring(7)}`;

    this.running = false;
    this.metrics = {
      batchesProcessed: 0,
      eventsPublished: 0,
      errors: 0,
    };
  }

  async start() {
    if (this.running) return;
    this.running = true;

    console.log(`[OutboxDispatcher] Started worker ${this.workerId}`);

    // Setup Graceful Shutdown
    process.on('SIGTERM', () => this.stop());
    process.on('SIGINT', () => this.stop());

    // Self-scheduling loop (no setInterval)
    while (this.running) {
      try {
        const processedCount = await this._processBatch();

        if (processedCount === 0) {
          await this._sleep(this.pollIntervalIdle);
        } else {
          await this._sleep(this.pollIntervalActive);
        }
      } catch (err) {
        this.metrics.errors++;
        console.error(`[OutboxDispatcher] Batch error:`, err);
        // Sleep on error to prevent tight crash loops
        await this._sleep(this.pollIntervalIdle);
      }
    }

    console.log(`[OutboxDispatcher] Worker ${this.workerId} stopped gracefully.`);
  }

  async stop() {
    console.log(
      `[OutboxDispatcher] Stopping worker ${this.workerId}... waiting for current batch to finish.`,
    );
    this.running = false;
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetches, Locks, Publishes, and Completes a batch of events
   * @returns {number} Number of events processed
   */
  async _processBatch() {
    const client = await this.pool.connect();
    let lockedEvents = [];

    try {
      await client.query('BEGIN');

      // 1. FOR UPDATE SKIP LOCKED to claim events
      // Includes claiming PENDING events AND reclaiming stalled IN_PROGRESS events (lease expired)
      const lockQuery = `
        WITH claimed AS (
          SELECT event_id
          FROM outbox_events
          WHERE status = 'PENDING' 
             OR (status = 'IN_PROGRESS' AND lease_until < NOW())
          ORDER BY occurred_at ASC
          LIMIT $1
          FOR UPDATE SKIP LOCKED
        )
        UPDATE outbox_events
        SET 
          status = 'IN_PROGRESS', 
          locked_by = $2, 
          locked_at = NOW(),
          lease_until = NOW() + INTERVAL '30 SECONDS'
        WHERE event_id IN (SELECT event_id FROM claimed)
        RETURNING *;
      `;

      const res = await client.query(lockQuery, [this.batchSize, this.workerId]);
      lockedEvents = res.rows;

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      throw err;
    }

    if (lockedEvents.length === 0) {
      client.release();
      return 0; // Idle
    }

    // 2. Publish to Broker (Publisher Confirms will wait here)
    const successfulEventIds = [];
    const failedEventIds = [];

    for (const row of lockedEvents) {
      try {
        // Construct standard EventEnvelope format from DB row
        const envelope = {
          eventId: row.event_id,
          eventType: row.event_type,
          eventVersion: row.event_version,
          occurredAt: row.occurred_at,
          traceId: row.metadata?.traceId,
          correlationId: row.metadata?.correlationId,
          aggregateId: row.aggregate_id,
          aggregateType: row.aggregate_type,
          payload: row.payload,
          metadata: row.metadata,
        };

        // Extract W3C Context from metadata
        const metadata = row.metadata || {};
        const activeContext = propagation.extract(context.active(), metadata);

        await context.with(activeContext, async () => {
          await this.publisher.publishEnvelope(envelope);
        });

        successfulEventIds.push(row.event_id);
      } catch (pubErr) {
        console.error(`[OutboxDispatcher] Failed to publish event ${row.event_id}:`, pubErr);
        failedEventIds.push(row.event_id);
      }
    }

    // 3. Mark Completed/Failed
    try {
      await client.query('BEGIN');

      if (successfulEventIds.length > 0) {
        await client.query(
          `
          UPDATE outbox_events 
          SET status = 'PUBLISHED', processed_at = NOW()
          WHERE event_id = ANY($1)
        `,
          [successfulEventIds],
        );
      }

      // If we failed to publish, we revert them to PENDING and increment attempt
      // This will allow them to be picked up again
      if (failedEventIds.length > 0) {
        await client.query(
          `
          UPDATE outbox_events
          SET status = 'PENDING', attempt = attempt + 1
          WHERE event_id = ANY($1)
        `,
          [failedEventIds],
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(
        '[OutboxDispatcher] Failed to update statuses, events will be reclaimed after lease expires',
      );
    } finally {
      client.release();
    }

    // Update internal metrics
    this.metrics.batchesProcessed++;
    this.metrics.eventsPublished += successfulEventIds.length;

    return lockedEvents.length;
  }
}
