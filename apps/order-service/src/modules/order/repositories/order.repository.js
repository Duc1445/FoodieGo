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
          o.subtotal, o.delivery_fee, o.tax, o.discount, o.total, o.created_at,
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
            '[]'
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
}
