import pool from '../config/database.js';

/**
 * Create an order with items inside a transaction.
 * @param {{ userId, note, address, items: [{ food_id, quantity, price }] }} data
 */
export const create = async ({ userId, note, address, items }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Calculate total price
    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    // Insert order
    const { rows: [order] } = await client.query(
      `INSERT INTO orders (id, user_id, status, total_price, note, address, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'pending', $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [userId, totalPrice, note || null, address || null]
    );

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (id, order_id, food_id, quantity, price)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        [order.id, item.food_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Find all orders belonging to a user.
 */
export const findByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

/**
 * Find a single order by ID, including its items joined with foods.
 */
export const findById = async (orderId) => {
  const { rows: orders } = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  );
  if (orders.length === 0) return null;

  const { rows: items } = await pool.query(
    `SELECT oi.*, f.name AS food_name
     FROM order_items oi
     JOIN foods f ON f.id = oi.food_id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  return { ...orders[0], items };
};

/**
 * Update the status of an order.
 */
export const updateStatus = async (orderId, status) => {
  const { rows } = await pool.query(
    `UPDATE orders SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [orderId, status]
  );
  return rows[0];
};
