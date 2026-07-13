/**
 * Task 2: Delivery Idempotency Verification
 * Calls changeOrderStatus(orderId, READY) three times on same order.
 * Expects exactly 1 delivery row after all three calls.
 */
import { OrderService } from './src/modules/order/services/order.service.js';

const ORDER_ID = 'd6d68ea9-b82d-4edd-8313-afda3bb748bd';
const orderService = new OrderService();

async function run() {
  console.log(`\n=== Idempotency Test for order ${ORDER_ID} ===\n`);

  // Call 1 - transitions PREPARING → READY, delivery created
  try {
    const r1 = await orderService.changeOrderStatus(ORDER_ID, 'READY', 'system');
    console.log('Call 1 result:', JSON.stringify(r1));
  } catch (e) {
    console.log('Call 1 error:', e.message);
  }

  // Call 2 - READY → READY = invalid transition (state machine blocks it)
  try {
    const r2 = await orderService.changeOrderStatus(ORDER_ID, 'READY', 'system');
    console.log('Call 2 result:', JSON.stringify(r2));
  } catch (e) {
    console.log('Call 2 error (expected - invalid transition):', e.message);
  }

  // Call 3 - same, invalid transition
  try {
    const r3 = await orderService.changeOrderStatus(ORDER_ID, 'READY', 'system');
    console.log('Call 3 result:', JSON.stringify(r3));
  } catch (e) {
    console.log('Call 3 error (expected - invalid transition):', e.message);
  }

  console.log('\nDone. Check delivery count in DB.');
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
