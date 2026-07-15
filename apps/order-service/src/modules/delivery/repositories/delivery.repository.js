import pool from '../../../config/database.js';

export const create = async (orderId) => {
  const { rows } = await pool.query(
    `INSERT INTO delivery (id, order_id, status, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, 'waiting', NOW(), NOW())
     RETURNING *`,
    [orderId],
  );
  return rows[0];
};

export const findByOrderId = async (orderId) => {
  const { rows } = await pool.query(`SELECT * FROM delivery WHERE order_id = $1`, [orderId]);
  return rows[0] || null;
};

export const assignDriver = async (deliveryId, driverId) => {
  const { rows } = await pool.query(
    `UPDATE delivery SET driver_id = $2, status = 'accepted', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [deliveryId, driverId],
  );
  return rows[0];
};

export const updateStatus = async (deliveryId, status) => {
  const { rows } = await pool.query(
    `UPDATE delivery SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [deliveryId, status],
  );
  return rows[0];
};

export const listDeliveries = async ({
  status,
  orderId,
  driverId,
  limit = 10,
  offset = 0,
  sort = 'created_at',
}) => {
  // Only created_at is supported for sorting based on requirements
  const orderDirection = sort.startsWith('-') ? 'DESC' : 'ASC';

  let query = `
    SELECT 
      d.*, 
      o.delivery_fee, 
      o.total, 
      o.user_id as customer_id,
      u.name as customer_name,
      r.name as restaurant_name
    FROM delivery d
    LEFT JOIN orders o ON d.order_id = o.id
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN restaurants r ON o.restaurant_id = r.id
    WHERE 1=1
  `;
  const values = [];

  if (status) {
    values.push(status);
    query += ` AND d.status = $${values.length}`;
  }

  if (orderId) {
    values.push(orderId);
    query += ` AND d.order_id = $${values.length}`;
  }

  if (driverId) {
    values.push(driverId);
    query += ` AND d.driver_id = $${values.length}`;
  }

  query += ` ORDER BY d.created_at ${orderDirection}`;

  values.push(limit);
  query += ` LIMIT $${values.length}`;

  values.push(offset);
  query += ` OFFSET $${values.length}`;

  const { rows } = await pool.query(query, values);
  return rows;
};

export const getDriverStats = async (driverId) => {
  const { rows: generalStats } = await pool.query(
    `
    SELECT 
      COUNT(*) AS total_deliveries,
      COALESCE(SUM(o.delivery_fee), 0) AS total_earnings,
      COUNT(*) FILTER (WHERE d.created_at::date = CURRENT_DATE) AS today_deliveries,
      COALESCE(SUM(o.delivery_fee) FILTER (WHERE d.created_at::date = CURRENT_DATE), 0) AS today_earnings,
      COALESCE(SUM(o.delivery_fee) FILTER (WHERE date_trunc('month', d.created_at) = date_trunc('month', CURRENT_DATE)), 0) AS monthly_earnings
    FROM delivery d
    JOIN orders o ON d.order_id = o.id
    WHERE d.driver_id = $1 AND d.status = 'delivered'
  `,
    [driverId],
  );

  const { rows: earningsByDay } = await pool.query(
    `
    SELECT TO_CHAR(d.created_at, 'YYYY-MM-DD') as date, COALESCE(SUM(o.delivery_fee), 0) as earnings
    FROM delivery d
    JOIN orders o ON d.order_id = o.id
    WHERE d.driver_id = $1 AND d.status = 'delivered' AND d.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY TO_CHAR(d.created_at, 'YYYY-MM-DD')
    ORDER BY date ASC
  `,
    [driverId],
  );

  return {
    ...(generalStats[0] || {
      total_deliveries: 0,
      total_earnings: 0,
      today_deliveries: 0,
      today_earnings: 0,
      monthly_earnings: 0,
    }),
    earnings_by_day: earningsByDay,
  };
};
