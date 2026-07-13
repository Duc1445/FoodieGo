import 'dotenv/config';
import { OrderService } from '../modules/order/services/order.service.js';
import { OrderRepository } from '../modules/order/repositories/order.repository.js';
import { runTimeoutSweep } from '../workers/saga-timeout.worker.js';
import pool from '../config/database.js';

describe('Commutative Saga Evaluator', () => {
  let orderService;
  let orderRepository;
  let client;

  beforeAll(async () => {
    orderService = new OrderService();
    orderRepository = new OrderRepository();
    client = await pool.connect();
    // Clean up before tests
    await client.query('DELETE FROM outbox_events');
    await client.query('DELETE FROM orders');
    
    // Create dummy user and restaurant for foreign keys
    await client.query(`
      INSERT INTO users (id, email, password, full_name)
      VALUES ('11111111-1111-1111-1111-111111111111', 'test@test.com', 'pwd', 'Test User')
      ON CONFLICT (id) DO NOTHING;
    `);
    await client.query(`
      INSERT INTO restaurants (id, name)
      VALUES ('22222222-2222-2222-2222-222222222222', 'Test Restaurant')
      ON CONFLICT (id) DO NOTHING;
    `);
  });

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  afterEach(async () => {
    await pool.query('DELETE FROM outbox_events');
    await pool.query('DELETE FROM orders');
  });

  async function createTestOrder() {
    const res = await pool.query(`
      INSERT INTO orders (
        user_id, restaurant_id, status, subtotal, delivery_fee, tax, discount, total, currency, payment_method, created_at
      ) VALUES (
        '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'PENDING', 100, 10, 5, 0, 115, 'USD', 'CREDIT_CARD', NOW()
      ) RETURNING id
    `);
    return res.rows[0].id;
  }

  it('Case 1: Payment -> Inventory -> Confirm', async () => {
    const orderId = await createTestOrder();
    const trx = await pool.connect();
    await trx.query('BEGIN');

    await orderService.processPaymentAuthorized({ payload: { orderId }, metadata: {} }, trx);
    await orderService.processInventoryReserved({ payload: { orderId }, metadata: {} }, trx);
    
    await trx.query('COMMIT');
    trx.release();

    const order = await pool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    expect(order.rows[0].status).toBe('CONFIRMED');
    
    const outbox = await pool.query("SELECT event_type FROM outbox_events WHERE aggregate_id = $1 AND event_type = 'OrderConfirmed'", [orderId]);
    expect(outbox.rowCount).toBe(1);
  });

  it('Case 2: Inventory -> Payment -> Confirm', async () => {
    const orderId = await createTestOrder();
    const trx = await pool.connect();
    await trx.query('BEGIN');

    await orderService.processInventoryReserved({ payload: { orderId }, metadata: {} }, trx);
    await orderService.processPaymentAuthorized({ payload: { orderId }, metadata: {} }, trx);
    
    await trx.query('COMMIT');
    trx.release();

    const order = await pool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    expect(order.rows[0].status).toBe('CONFIRMED');
    
    const outbox = await pool.query("SELECT event_type FROM outbox_events WHERE aggregate_id = $1 AND event_type = 'OrderConfirmed'", [orderId]);
    expect(outbox.rowCount).toBe(1);
  });

  it('Case 3 & 4: Payment -> Payment or Inventory -> Inventory -> no duplicate', async () => {
    const orderId = await createTestOrder();
    const trx = await pool.connect();
    await trx.query('BEGIN');

    // Duplicate Payment
    await orderService.processPaymentAuthorized({ payload: { orderId }, metadata: {} }, trx);
    await orderService.processPaymentAuthorized({ payload: { orderId }, metadata: {} }, trx);
    
    // Duplicate Inventory
    await orderService.processInventoryReserved({ payload: { orderId }, metadata: {} }, trx);
    await orderService.processInventoryReserved({ payload: { orderId }, metadata: {} }, trx);
    
    await trx.query('COMMIT');
    trx.release();

    const outbox = await pool.query("SELECT event_type FROM outbox_events WHERE aggregate_id = $1 AND event_type = 'OrderConfirmed'", [orderId]);
    expect(outbox.rowCount).toBe(1); // exactly one
  });

  it('Case 5: Payment -> Timeout -> Cancel and Refund', async () => {
    const orderId = await createTestOrder();
    const trx = await pool.connect();
    await trx.query('BEGIN');
    
    await orderService.processPaymentAuthorized({ payload: { orderId }, metadata: {} }, trx);
    await trx.query('COMMIT');
    trx.release();

    // Fast-forward created_at to trigger timeout
    await pool.query("UPDATE orders SET created_at = NOW() - INTERVAL '6 MINUTES' WHERE id = $1", [orderId]);

    // Run timeout sweep
    await runTimeoutSweep();

    const order = await pool.query('SELECT status, is_cancelled FROM orders WHERE id = $1', [orderId]);
    expect(order.rows[0].status).toBe('CANCELLED');
    expect(order.rows[0].is_cancelled).toBe(true);

    const outbox = await pool.query("SELECT event_type FROM outbox_events WHERE aggregate_id = $1", [orderId]);
    const eventTypes = outbox.rows.map(r => r.event_type);
    expect(eventTypes).toContain('RefundPaymentCommand');
    expect(eventTypes).toContain('OrderCancelled');
    expect(eventTypes).not.toContain('ReleaseInventoryCommand');
  });

  it('Case 6: Timeout -> Inventory arrives later -> ReleaseInventoryCommand', async () => {
    const orderId = await createTestOrder();
    
    // Fast-forward created_at to trigger timeout
    await pool.query("UPDATE orders SET created_at = NOW() - INTERVAL '6 MINUTES' WHERE id = $1", [orderId]);
    
    // Run timeout sweep (cancels the order)
    await runTimeoutSweep();

    // Inventory arrives late
    const trx = await pool.connect();
    await trx.query('BEGIN');
    await orderService.processInventoryReserved({ payload: { orderId }, metadata: {} }, trx);
    await trx.query('COMMIT');
    trx.release();

    // Wait, processInventoryReserved only sets `is_inventory_reserved = true`.
    // It doesn't trigger compensation if it arrives late!
    // The design states: if order is already cancelled, late arrivals should be compensated?
    // Let's check `processInventoryReserved` logic... if cancelled, we should emit compensation immediately!
    // I need to fix `processInventoryReserved` to handle late arrivals!
    
    const outbox = await pool.query("SELECT event_type FROM outbox_events WHERE aggregate_id = $1", [orderId]);
    const eventTypes = outbox.rows.map(r => r.event_type);
    expect(eventTypes).toContain('ReleaseInventoryCommand');
  });

  it('Case 7: Concurrent Payment, Inventory -> OrderConfirmed exactly once', async () => {
    const orderId = await createTestOrder();

    // Spawn 100 concurrent promises simulating interleaving messages
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push((async () => {
        const trx = await pool.connect();
        try {
          await trx.query('BEGIN');
          await orderService.processPaymentAuthorized({ payload: { orderId }, metadata: {} }, trx);
          await trx.query('COMMIT');
        } finally { trx.release(); }
      })());
      
      promises.push((async () => {
        const trx = await pool.connect();
        try {
          await trx.query('BEGIN');
          await orderService.processInventoryReserved({ payload: { orderId }, metadata: {} }, trx);
          await trx.query('COMMIT');
        } finally { trx.release(); }
      })());
    }

    await Promise.all(promises);

    const outbox = await pool.query("SELECT event_type FROM outbox_events WHERE aggregate_id = $1 AND event_type = 'OrderConfirmed'", [orderId]);
    expect(outbox.rowCount).toBe(1); // exactly one
  });
});
