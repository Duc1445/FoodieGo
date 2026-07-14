import { OrderMapper, OrderItemMapper } from '../mappers/order.mapper.js';

export async function seedOrders(pool, data) {
  console.log('[Demo] Seeding Orders...');
  for (const order of data) {
    const values = OrderMapper.toDb(order);
    await pool.query(
      `INSERT INTO orders (id, user_id, restaurant_id, status, subtotal, delivery_fee, total, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET 
         status = EXCLUDED.status,
         subtotal = EXCLUDED.subtotal,
         delivery_fee = EXCLUDED.delivery_fee,
         total = EXCLUDED.total`,
      values
    );

    if (order.items) {
      for (const item of order.items) {
        const itemValues = OrderItemMapper.toDb(item);
        await pool.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, quantity, item_name, item_price, price_version)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET 
             quantity = EXCLUDED.quantity,
             item_name = EXCLUDED.item_name,
             item_price = EXCLUDED.item_price`,
          itemValues
        );
      }
    }
  }
}
