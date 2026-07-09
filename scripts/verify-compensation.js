import 'dotenv/config';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { EventPublisher, RabbitMQAdapter } from '@foodiego/events';

const { Pool } = pg;

async function verifyCompensation() {
  console.log('Simulating RestaurantRejected to trigger Saga Compensation...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/foodiego',
  });

  const rabbitMQ = new RabbitMQAdapter(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
  await rabbitMQ.connect();

  const publisher = new EventPublisher(rabbitMQ);

  const orderId = uuidv4();
  const paymentId = uuidv4();
  const traceId = uuidv4();

  // Create a fake payment in DB to refund
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO payments (id, order_id, amount, currency, status, payment_method, gateway_tx_id, idempotency_key)
      VALUES ($1, $2, 15.00, 'USD', 'CAPTURED', 'CARD', 'mock_tx_123', $3)
    `, [paymentId, orderId, traceId]);

    console.log(`[Setup] Created fake payment ${paymentId} for order ${orderId}`);

    // Publish RestaurantRejected
    const event = {
      eventType: 'RestaurantRejected',
      eventVersion: 1,
      payload: {
        orderId,
        reason: 'Out of stock on main item',
        traceId
      },
      metadata: {
        correlation_id: traceId,
        causation_id: traceId
      }
    };

    console.log('[Test] Publishing RestaurantRejected event...');
    await publisher.publishEnvelope(event);

    console.log('[Verify] Waiting 2 seconds for saga to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Assert Payment is REFUNDED
    const payment = await client.query('SELECT status, error_reason FROM payments WHERE id = $1', [paymentId]);
    
    if (payment.rows[0].status === 'REFUNDED') {
      console.log('✅ PASS: Payment was successfully refunded by compensation saga.');
    } else {
      console.error('❌ FAIL: Payment status is', payment.rows[0].status);
    }
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    client.release();
    await pool.end();
    setTimeout(() => process.exit(0), 500);
  }
}

verifyCompensation();
