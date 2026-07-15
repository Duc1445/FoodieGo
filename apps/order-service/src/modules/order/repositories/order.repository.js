import pool from '../../../config/database.js';

export class OrderRepository {
  async findOrdersByUserId(userId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT id, restaurant_id as "restaurantId", status, total, created_at as "createdAt"
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      const result = await client.query(query, [userId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findOrdersByRestaurantId(restaurantId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT id, user_id as "userId", status, total, created_at as "createdAt"
        FROM orders
        WHERE restaurant_id = $1
        ORDER BY created_at DESC
      `;
      const result = await client.query(query, [restaurantId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findOrderDetailById(orderId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          o.id, o.user_id, o.restaurant_id, o.status, 
          o.subtotal, o.delivery_fee, o.tax, o.discount, o.total, o.created_at, o.payment_method,
          (
            SELECT json_build_object(
              'id', d.id,
              'driverId', d.driver_id,
              'status', d.status,
              'driverName', u.full_name,
              'driverPhone', u.phone
            )
            FROM delivery d
            LEFT JOIN users u ON d.driver_id = u.id
            WHERE d.order_id = o.id
            LIMIT 1
          ) as delivery,
          (
            SELECT COALESCE(json_agg(
              json_build_object(
                'code', p.code,
                'discountValue', pu.discount_value
              )
            ), '[]'::json)
            FROM promotion_usages pu
            JOIN promotions p ON pu.promotion_id = p.id
            WHERE pu.order_id = o.id
          ) as promotions,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'menuItemId', oi.menu_item_id,
                'quantity', oi.quantity,
                'itemName', oi.item_name,
                'itemPrice', oi.item_price
              )
            ) FILTER (WHERE oi.id IS NOT NULL), 
            '[]'::json
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
        GROUP BY o.id
      `;
      const result = await client.query(query, [orderId]);
      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        restaurantId: row.restaurant_id,
        status: row.status,
        subtotal: row.subtotal,
        deliveryFee: row.delivery_fee,
        tax: row.tax,
        discount: row.discount,
        total: row.total,
        createdAt: row.created_at,
        items: row.items,
      };
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(orderId, status) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE orders
        SET status = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING id, status
      `;
      const result = await client.query(query, [orderId, status]);
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // --- SAGA EVALUATOR METHODS ---

  async findByIdForUpdate(trx, orderId) {
    const result = await trx.query(
      `SELECT id, status, is_payment_authorized, is_inventory_reserved, is_cancelled 
       FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId],
    );
    return result.rows[0] || null;
  }

  async setPaymentAuthorized(trx, orderId) {
    await trx.query(
      `UPDATE orders SET is_payment_authorized = true, updated_at = NOW() WHERE id = $1`,
      [orderId],
    );
  }

  async setInventoryReserved(trx, orderId) {
    await trx.query(
      `UPDATE orders SET is_inventory_reserved = true, updated_at = NOW() WHERE id = $1`,
      [orderId],
    );
  }

  async setCancelled(trx, orderId) {
    await trx.query(`UPDATE orders SET is_cancelled = true, updated_at = NOW() WHERE id = $1`, [
      orderId,
    ]);
  }

  /**
   * Atomics state transition for Saga Evaluator.
   * Returns true if this transaction was the one to successfully move to CONFIRMED.
   */
  async tryConfirmOrder(trx, orderId) {
    const result = await trx.query(
      `UPDATE orders 
       SET status = 'CONFIRMED', updated_at = NOW()
       WHERE id = $1 
         AND status = 'PENDING'
         AND is_payment_authorized = true
         AND is_inventory_reserved = true
         AND is_cancelled = false
       RETURNING id`,
      [orderId],
    );
    return result.rowCount === 1;
  }

  async getAllOrders({ status, page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT id, user_id as "userId", restaurant_id as "restaurantId", status, total, created_at as "createdAt", updated_at as "updatedAt"
      FROM orders
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` WHERE status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  }

  async findById(orderId) {
    const { rows } = await pool.query(
      'SELECT id, user_id as "userId", restaurant_id as "restaurantId", status, subtotal, delivery_fee as "deliveryFee", tax, discount, total, created_at as "createdAt", updated_at as "updatedAt" FROM orders WHERE id = $1',
      [orderId],
    );
    return rows[0] || null;
  }

  async getAdminStats() {
    const { rows } = await pool.query(`
      SELECT 
        -- Support Metrics
        (SELECT COUNT(*) FROM support_tickets) AS total_tickets,
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'OPEN') AS open_tickets,
        (SELECT COUNT(*) FROM support_tickets WHERE status = 'CLOSED') AS closed_tickets,
        
        -- Promotion Metrics
        (SELECT COUNT(*) FROM promotions) AS total_promotions,
        (SELECT COUNT(*) FROM promotions WHERE is_active = true) AS active_promotions,
        (SELECT COUNT(*) FROM promotions WHERE promotion_type = 'merchant' AND approval_status = 'PENDING') AS pending_voucher_approvals,
        
        -- Platform Health & User Metrics
        (SELECT COUNT(*) FROM restaurants) AS total_restaurants,
        (SELECT COUNT(*) FROM restaurants WHERE is_active = true) AS active_restaurants,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'driver') AS total_drivers,
        (SELECT COUNT(*) FROM users WHERE role = 'merchant') AS total_merchants
    `);
    return (
      rows[0] || {
        total_tickets: 0,
        open_tickets: 0,
        closed_tickets: 0,
        total_promotions: 0,
        active_promotions: 0,
        pending_voucher_approvals: 0,
        total_restaurants: 0,
        active_restaurants: 0,
        total_customers: 0,
        total_drivers: 0,
        total_merchants: 0,
      }
    );
  }

  async getMerchantStats(restaurantId) {
    const { rows: generalStats } = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE restaurant_id = $1) AS total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE restaurant_id = $1 AND status = 'COMPLETED') AS total_revenue
    `,
      [restaurantId],
    );

    const { rows: revenueByDay } = await pool.query(
      `
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE restaurant_id = $1 AND status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `,
      [restaurantId],
    );

    const { rows: revenueByMonth } = await pool.query(
      `
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE restaurant_id = $1 AND status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `,
      [restaurantId],
    );

    return {
      total_orders: generalStats[0]?.total_orders || 0,
      total_revenue: generalStats[0]?.total_revenue || 0,
      revenue_by_day: revenueByDay,
      revenue_by_month: revenueByMonth,
    };
  }
}
