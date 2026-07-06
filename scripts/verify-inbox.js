import pg from 'pg';
import { execSync } from 'child_process';

const { Pool } = pg;

async function run() {
  console.log('--- Inbox Idempotency Verification ---');
  
  const poolOrder = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });
  const poolInventory = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });

  try {
    // 1. Find a successfully processed order
    const { rows: orderRows } = await poolOrder.query(`
      SELECT id FROM orders WHERE status = 'READY_FOR_PAYMENT' LIMIT 1
    `);
    
    if (orderRows.length === 0) {
      console.log('No READY_FOR_PAYMENT orders found. Run k6 tests first.');
      return;
    }
    const orderId = orderRows[0].id;
    console.log(`[1] Selected successfully processed Order: ${orderId}`);

    // 2. Get the Inventory stock before replay
    const { rows: invBeforeRows } = await poolInventory.query(`
      SELECT reserved_quantity FROM inventory_stock WHERE stock_item_id = '10000000-0000-0000-0000-000000000100'
    `);
    const reservedBefore = invBeforeRows[0].reserved_quantity;
    console.log(`[2] Current reserved_quantity for Item: ${reservedBefore}`);

    // 3. Find the OrderPendingReservation event in outbox
    const { rows: outboxRows } = await poolOrder.query(`
      SELECT event_id FROM outbox_events 
      WHERE aggregate_id = $1 AND event_type = 'OrderPendingReservation'
    `, [orderId]);
    const eventId = outboxRows[0].event_id;
    console.log(`[3] Found outbox event: ${eventId}`);

    // 4. Replay the event using replay-cli
    console.log(`[4] Replaying event using replay-cli.js (Force mode)`);
    execSync(`node scripts/replay-cli.js --event OrderPendingReservation --aggregate ${orderId} --force`, { stdio: 'inherit' });

    // Wait a brief moment for the message to traverse RabbitMQ
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Verify the Inbox table block
    const { rows: inboxRows } = await poolInventory.query(`
      SELECT status, attempt FROM inbox_events 
      WHERE event_id = $1 AND consumer_name = 'OrderPendingReservationConsumer'
    `, [eventId]);
    console.log(`[5] Inbox record state: Status = ${inboxRows[0]?.status}, Attempt = ${inboxRows[0]?.attempt}`);

    // 6. Verify stock has NOT changed
    const { rows: invAfterRows } = await poolInventory.query(`
      SELECT reserved_quantity FROM inventory_stock WHERE stock_item_id = '10000000-0000-0000-0000-000000000100'
    `);
    const reservedAfter = invAfterRows[0].reserved_quantity;
    console.log(`[6] Current reserved_quantity for Item: ${reservedAfter}`);

    if (reservedBefore === reservedAfter && inboxRows[0]?.status === 'COMPLETED') {
      console.log('✅ Inbox Idempotency Verified! The event was dropped as a duplicate and stock was not double-deducted.');
    } else {
      console.error('❌ Inbox Idempotency Failed!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await poolOrder.end();
    await poolInventory.end();
  }
}

run();
