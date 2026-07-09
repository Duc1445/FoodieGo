import 'dotenv/config';
import pg from 'pg';
import { connect } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;

async function replayDLQ() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/foodiego',
  });

  const amqpUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const connection = await connect(amqpUrl);
  const channel = await connection.createChannel();

  const exchange = process.env.EVENT_EXCHANGE || 'foodiego_exchange';

  // Make sure replay exchange and queue exist, or we can just publish directly 
  // with a routing key that a specific replay consumer listens to.
  // The CTO asked for: DLQ -> Replay Queue -> Replay Consumer -> Original Exchange
  const replayExchange = 'replay_exchange';
  await channel.assertExchange(replayExchange, 'topic', { durable: true });

  const client = await pool.connect();
  try {
    // 1. Fetch DLQ events
    const res = await client.query(`
      SELECT * FROM dead_letter_events 
      WHERE id NOT IN (SELECT dlq_id FROM replay_history WHERE result = 'SUCCESS')
      ORDER BY occurred_at ASC 
      LIMIT 100
    `);

    if (res.rows.length === 0) {
      console.log('No eligible dead letter events found for replay.');
      return;
    }

    console.log(`Found ${res.rows.length} events to replay.`);

    for (const row of res.rows) {
      const replayId = uuidv4();
      
      const envelope = {
        eventId: row.event_id,
        eventType: row.event_type,
        eventVersion: row.event_version,
        aggregateId: row.aggregate_id,
        aggregateType: row.aggregate_type,
        occurredAt: row.occurred_at,
        payload: row.payload,
        metadata: {
          ...row.metadata,
          'x-replay-id': replayId,
          'x-replay-reason': 'Manual CLI replay',
          'x-replay-time': new Date().toISOString()
        }
      };

      const routingKey = `event.${row.aggregate_type.toLowerCase()}.${row.event_type}`;

      // 2. Publish to Replay Exchange
      channel.publish(
        replayExchange,
        routingKey,
        Buffer.from(JSON.stringify(envelope)),
        { persistent: true }
      );

      // 3. Log to replay_history
      await client.query(`
        INSERT INTO replay_history (dlq_id, replay_id, operator, reason, result)
        VALUES ($1, $2, 'cli_admin', 'Manual DLQ Replay', 'SUCCESS')
      `, [row.id, replayId]);

      console.log(`[Replayed] Event ${row.event_id} (Replay ID: ${replayId})`);
    }

  } catch (err) {
    console.error('Replay failed:', err);
  } finally {
    client.release();
    await pool.end();
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  }
}

replayDLQ();
