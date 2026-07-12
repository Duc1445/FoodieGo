import { CheckoutRepository } from '../modules/checkout/repositories/checkout.repository.js';
import pool from '../config/database.js';
import crypto from 'crypto';

describe('Inventory Bypass Test (Demo)', () => {
  let checkoutRepo;
  let userId;
  let restaurantId;
  const sku1 = 'test-item-1';
  const sku2 = 'test-item-2';

  beforeAll(async () => {
    checkoutRepo = new CheckoutRepository();
    userId = crypto.randomUUID();
    restaurantId = crypto.randomUUID();

    // Seed test inventory data
    const client = await pool.connect();
    try {
      await client.query(
        `
        INSERT INTO inventory_stock (stock_item_id, total_quantity, reserved_quantity, version)
        VALUES ($1, 10, 0, 1), ($2, 5, 5, 1)
        ON CONFLICT (stock_item_id) DO UPDATE SET total_quantity = EXCLUDED.total_quantity, reserved_quantity = EXCLUDED.reserved_quantity
      `,
        [sku1, sku2],
      );
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  it('Case 1: Should successfully create an order with sufficient stock', async () => {
    const orderId = await checkoutRepo.createOrderWithInventoryCheck(
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
      [{ menuItemId: sku1, quantity: 2, itemName: 'Mock Food 1', itemPrice: 50, priceVersion: 1 }],
      null,
    );

    expect(orderId).toBeDefined();

    const client = await pool.connect();
    try {
      const stockCheck = await client.query(
        'SELECT reserved_quantity FROM inventory_stock WHERE stock_item_id = $1',
        [sku1],
      );
      expect(stockCheck.rows[0].reserved_quantity).toBe(2);

      const orderCheck = await client.query('SELECT status FROM orders WHERE id = $1', [orderId]);
      expect(orderCheck.rows[0].status).toBe('CONFIRMED');
    } finally {
      client.release();
    }
  });

  it('Case 2: Should fail to create order with insufficient stock', async () => {
    await expect(
      checkoutRepo.createOrderWithInventoryCheck(
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
      ),
    ).rejects.toThrow(/out of stock/);
  });
});
