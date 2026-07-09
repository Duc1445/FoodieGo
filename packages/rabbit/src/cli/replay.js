#!/usr/bin/env node

import { parseArgs } from 'util';
import pkg from 'pg';
import { RabbitMQAdapter } from '../adapters/rabbitmq.adapter.js';

const { Pool } = pkg;

const options = {
  event: { type: 'string' },
  from: { type: 'string' },
  to: { type: 'string' },
  aggregate: { type: 'string' },
  limit: { type: 'string', default: '100' }
};

const { values } = parseArgs({ options });

async function replay() {
  console.log('[Replay CLI] Starting Replay operation...');
  console.log('[Replay CLI] Filters:', values);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/foodiego' });
  const rabbit = new RabbitMQAdapter(process.env.RABBITMQ_URL || 'amqp://localhost');
  
  try {
    let query = 'SELECT * FROM dead_letter_events WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (values.event) {
      query += ` AND event_type = $${paramCount++}`;
      params.push(values.event);
    }
    if (values.from) {
      query += ` AND failed_at >= $${paramCount++}`;
      params.push(new Date(values.from));
    }
    if (values.to) {
      query += ` AND failed_at <= $${paramCount++}`;
      params.push(new Date(values.to));
    }
    if (values.aggregate) {
      query += ` AND payload->'aggregate'->>'id' = $${paramCount++}`;
      params.push(values.aggregate);
    }

    query += ` ORDER BY failed_at ASC LIMIT $${paramCount++}`;
    params.push(parseInt(values.limit));

    const result = await pool.query(query, params);
    
    if (result.rowCount === 0) {
      console.log('[Replay CLI] No events found matching filters.');
      return;
    }

    console.log(`[Replay CLI] Found ${result.rowCount} events. Replaying...`);
    
    for (const row of result.rows) {
      console.log(`  -> Replaying Event ID: ${row.event_id} (${row.event_type})`);
      
      // We publish the exact payload that failed
      await rabbit.publish(row.payload);

      // Once published, we can remove it from DLQ
      await pool.query('DELETE FROM dead_letter_events WHERE id = $1', [row.id]);
    }

    console.log('[Replay CLI] Replay completed successfully.');
  } catch (err) {
    console.error('[Replay CLI] Error during replay:', err);
  } finally {
    await rabbit.close();
    await pool.end();
  }
}

replay();
