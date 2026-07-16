const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });

async function check() {
  try {
    const userId = '00000000-0000-4000-2222-000000000001';
    
    // 1. Get authorized restaurant IDs
    const { rows } = await pool.query(
      'SELECT restaurant_id FROM user_restaurants WHERE user_id = $1',
      [userId],
    );
    const authorizedRestaurantIds = rows.map((r) => r.restaurant_id);
    console.log('authorizedRestaurantIds:', authorizedRestaurantIds);

    // 2. Get order restaurant ID
    const orderQuery = `
        SELECT 
          o.id, o.user_id, o.restaurant_id, o.status
        FROM orders o
        LIMIT 1
    `;
    const orderRes = await pool.query(orderQuery);
    if (orderRes.rows.length > 0) {
      const order = orderRes.rows[0];
      const restaurantId = order.restaurant_id;
      console.log('order.restaurantId:', restaurantId);
      
      console.log('Includes?', authorizedRestaurantIds.includes(restaurantId));
    }
  } catch(err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
