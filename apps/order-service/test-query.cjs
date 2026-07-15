const { Client } = require('pg');
const client = new Client('postgres://foodiego:foodiego123@localhost:5432/foodiego');

async function run() {
  await client.connect();
  try {
    const res = await client.query(`
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
            ), '[]')
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
            '[]'
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = 'e96f0a31-c595-41a5-9fba-89e4a2e5a791'
        GROUP BY o.id
    `);
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
