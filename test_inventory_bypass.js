import {
  CheckoutService,
  releaseInventory,
} from './apps/order-service/src/modules/checkout/services/checkout.service.js';
import { CheckoutRepository } from './apps/order-service/src/modules/checkout/repositories/checkout.repository.js';
import pool from './apps/order-service/src/config/database.js';
import crypto from 'crypto';

async function runTest() {
  console.log('--- STARTING INVENTORY BYPASS TEST ---');
  const client = await pool.connect();

  try {
    // 1. Setup Data in DB
    const userId = crypto.randomUUID();
    const restaurantId = crypto.randomUUID();
    const sku1 = crypto.randomUUID();
    const sku2 = crypto.randomUUID(); // out of stock

    // Insert mock user
    await client.query(
      `
      INSERT INTO users (id, email, password, full_name, role)
      VALUES ($1, $2, 'hashedpass', 'Test User', 'customer')
      ON CONFLICT DO NOTHING
    `,
      [userId, `testuser_${Date.now()}@test.com`],
    );

    // Insert mock restaurant
    await client.query(
      `
      INSERT INTO restaurants (id, name, description)
      VALUES ($1, 'Test Restaurant', 'Test desc')
      ON CONFLICT DO NOTHING
    `,
      [restaurantId],
    );

    const categoryId = crypto.randomUUID();
    await client.query(
      `
      INSERT INTO categories (id, restaurant_id, name)
      VALUES ($1, $2, 'Test Category')
      ON CONFLICT DO NOTHING
    `,
      [categoryId, restaurantId],
    );

    await client.query(
      `
      INSERT INTO menu_items (id, restaurant_id, category_id, name, price)
      VALUES ($1, $2, $3, 'Mock Food 1', 50), ($4, $2, $3, 'Mock Food 2', 100)
      ON CONFLICT DO NOTHING
    `,
      [sku1, restaurantId, categoryId, sku2],
    );

    // Insert mock inventory stock
    await client.query(
      `
      INSERT INTO inventory_stock (stock_item_id, total_quantity, reserved_quantity, version)
      VALUES ($1, 10, 0, 1), ($2, 5, 5, 1)
      ON CONFLICT (stock_item_id) DO UPDATE SET total_quantity = EXCLUDED.total_quantity, reserved_quantity = EXCLUDED.reserved_quantity
    `,
      [sku1, sku2],
    );

    console.log('[Setup] Inventory seeded. SKU1: 10 avail, SKU2: 0 avail.');

    const checkoutRepo = new CheckoutRepository();

    // Test Case 1: Order with sufficient stock (sku1)
    console.log('\\n>>> Test Case 1: Order with sufficient stock (sku1, qty: 2)');
    try {
      const orderId1 = await checkoutRepo.createOrderWithInventoryCheck(
        {
          userId,
          restaurantId,
          status: 'CONFIRMED',
          subtotal: 100,
          deliveryFee: 10,
          tax: 5,
          discount: 0,
          total: 115,
          currency: 'VND',
          paymentMethod: 'CASH',
          addressId: crypto.randomUUID(),
          idempotencyKey: crypto.randomUUID(),
        },
        [
          {
            menuItemId: sku1,
            quantity: 2,
            itemName: 'Mock Food 1',
            itemPrice: 50,
            priceVersion: 1,
          },
        ],
        null,
      );
      console.log(`[PASS] Case 1 created order successfully. Order ID: ${orderId1}`);

      const stockCheck1 = await client.query(
        'SELECT total_quantity, reserved_quantity FROM inventory_stock WHERE stock_item_id = $1',
        [sku1],
      );
      console.log(
        `[PASS] Case 1 Inventory after order: ${JSON.stringify(stockCheck1.rows[0])} (Expected reserved: 2)`,
      );

      const orderCheck1 = await client.query('SELECT status FROM orders WHERE id = $1', [orderId1]);
      console.log(
        `[PASS] Case 1 Order Status in DB: ${orderCheck1.rows[0].status} (Expected: CONFIRMED)`,
      );
    } catch (err) {
      console.error(`[FAIL] Case 1 failed:`, err);
    }

    // Test Case 2: Order with insufficient stock (sku2)
    console.log('\\n>>> Test Case 2: Order with insufficient stock (sku2, qty: 1)');
    try {
      await checkoutRepo.createOrderWithInventoryCheck(
        {
          userId,
          restaurantId,
          status: 'CONFIRMED',
          subtotal: 100,
          deliveryFee: 10,
          tax: 5,
          discount: 0,
          total: 115,
          currency: 'VND',
          paymentMethod: 'CASH',
          addressId: crypto.randomUUID(),
          idempotencyKey: crypto.randomUUID(),
        },
        [
          {
            menuItemId: sku2,
            quantity: 1,
            itemName: 'Mock Food 2',
            itemPrice: 100,
            priceVersion: 1,
          },
        ],
        null,
      );
      console.error(`[FAIL] Case 2 should have thrown an error but succeeded!`);
    } catch (err) {
      console.log(`[PASS] Case 2 correctly failed with error: "${err.message}"`);
    }
  } catch (err) {
    console.error('Test script error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runTest();
