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

export const listDeliveries = async ({ status, orderId, driverId, limit = 10, offset = 0, sort = 'created_at' }) => {
  // Only created_at is supported for sorting based on requirements
  const orderDirection = sort.startsWith('-') ? 'DESC' : 'ASC';
  
  let query = `SELECT * FROM delivery WHERE 1=1`;
  const values = [];
  
  if (status) {
    values.push(status);
    query += ` AND status = $${values.length}`;
  }
  
  if (orderId) {
    values.push(orderId);
    query += ` AND order_id = $${values.length}`;
  }
  
  if (driverId) {
    values.push(driverId);
    query += ` AND shipper_id = $${values.length}`;
  }
  
  query += ` ORDER BY created_at ${orderDirection}`;
  
  values.push(limit);
  query += ` LIMIT $${values.length}`;
  
  values.push(offset);
  query += ` OFFSET $${values.length}`;
  
  const { rows } = await pool.query(query, values);
  return rows;
};
