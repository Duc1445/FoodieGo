import pg from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { RabbitMQAdapter } from '@foodiego/events';

const { Pool } = pg;

async function run() {
  const argv = yargs(hideBin(process.argv))
    .option('event', { type: 'string', description: 'Event type to replay (e.g. OrderPendingReservation)' })
    .option('aggregate', { type: 'string', description: 'Aggregate ID to filter by' })
    .option('from', { type: 'string', description: 'Start date (ISO string)' })
    .option('to', { type: 'string', description: 'End date (ISO string)' })
    .option('limit', { type: 'number', default: 10, description: 'Max events to replay' })
    .option('dry-run', { type: 'boolean', default: false, description: 'Only show events without publishing' })
    .option('force', { type: 'boolean', default: false, description: 'Force replay even if not FAILED' })
    .argv;

  console.log(`[Replay CLI] Initializing...`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });
  const client = await pool.connect();

  try {
    let queryStr = `SELECT * FROM outbox_events WHERE 1=1`;
    const params = [];

    if (argv.event) {
      params.push(argv.event);
      queryStr += ` AND event_type = $${params.length}`;
    }
    if (argv.aggregate) {
      params.push(argv.aggregate);
      queryStr += ` AND aggregate_id = $${params.length}`;
    }
    if (argv.from) {
      params.push(argv.from);
      queryStr += ` AND occurred_at >= $${params.length}`;
    }
    if (argv.to) {
      params.push(argv.to);
      queryStr += ` AND occurred_at <= $${params.length}`;
    }
    if (!argv.force) {
      queryStr += ` AND status IN ('PENDING', 'FAILED')`;
    }

    queryStr += ` ORDER BY occurred_at ASC`;
    if (argv.limit) {
      params.push(argv.limit);
      queryStr += ` LIMIT $${params.length}`;
    }

    const { rows } = await client.query(queryStr, params);

    console.log(`[Replay CLI] Found ${rows.length} events to replay.`);

    if (argv.dryRun) {
      console.log(`[Replay CLI] DRY RUN - Exiting without publishing.`);
      for (const row of rows) {
        console.log(`  - ${row.event_id} | ${row.event_type} | ${row.aggregate_id} | ${row.status}`);
      }
      return;
    }

    if (rows.length === 0) {
      return;
    }

    const publisher = new RabbitMQAdapter(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
    await publisher.connect();
    console.log(`[Replay CLI] Connected to RabbitMQ.`);

    let successCount = 0;
    for (const row of rows) {
      try {
        const envelope = {
          id: row.event_id,
          type: row.event_type,
          version: row.event_version,
          occurredAt: row.occurred_at,
          traceId: row.metadata?.traceId,
          aggregate: {
            type: row.aggregate_type,
            id: row.aggregate_id
          },
          payload: row.payload,
          metadata: row.metadata
        };

        await publisher.publishEnvelope(envelope);
        console.log(`[Replay CLI] Published event ${row.event_id} (${row.event_type})`);
        successCount++;
      } catch (err) {
        console.error(`[Replay CLI] Failed to publish ${row.event_id}:`, err.message);
      }
    }

    await publisher.close();
    console.log(`[Replay CLI] Finished publishing. Success: ${successCount}/${rows.length}`);

  } catch (err) {
    console.error(`[Replay CLI] Error:`, err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
