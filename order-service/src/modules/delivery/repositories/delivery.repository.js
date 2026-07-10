import pool from '../../../config/database.js';

export const create = async (orderId) => {
  const { rows } = await pool.query(
    `INSERT INTO delivery (id, order_id, status, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, 'waiting', NOW(), NOW())
     RETURNING *`,
    [orderId]
  );
  return rows[0];
};

export const findByOrderId = async (orderId) => {
  const { rows } = await pool.query(
    `SELECT * FROM delivery WHERE order_id = $1`,
    [orderId]
  );
  return rows[0] || null;
};

export const assignShipper = async (deliveryId, shipperId) => {
  const { rows } = await pool.query(
    `UPDATE delivery SET shipper_id = $2, status = 'accepted', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [deliveryId, shipperId]
  );
  return rows[0];
};

export const updateStatus = async (deliveryId, status) => {
  const { rows } = await pool.query(
    `UPDATE delivery SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [deliveryId, status]
  );
  return rows[0];
};
