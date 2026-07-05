import pool from '../../../config/database.js';

export const create = async ({ userId, note, address, items, orderType }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const { rows: [order] } = await client.query(
      `INSERT INTO orders (id, user_id, status, total_price, note, address, order_type, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'pending', $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [userId, totalPrice, note || null, address || null, orderType || 'takeaway']
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, quantity, price)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        [order.id, item.menu_item_id, item.quantity, item.price]
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

export const findByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

export const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM orders ORDER BY created_at DESC`
  );
  return rows;
};

export const findById = async (orderId) => {
  const { rows: orders } = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  );
  if (orders.length === 0) return null;

  const { rows: items } = await pool.query(
    `SELECT oi.*, f.name AS menuItem_name
     FROM order_items oi
     JOIN menuItems f ON f.id = oi.menu_item_id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  return { ...orders[0], items };
};

export const updateStatus = async (orderId, status) => {
  const { rows } = await pool.query(
    `UPDATE orders SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [orderId, status]
  );
  return rows[0];
};
