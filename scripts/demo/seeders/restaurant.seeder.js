import { RestaurantMapper } from '../mappers/restaurant.mapper.js';

export async function seedRestaurants(pool, data, userRestaurantLinks) {
  console.log('[Demo] Seeding Restaurants...');
  for (const rest of data) {
    const values = RestaurantMapper.toDb(rest);
    await pool.query(
      `INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         cover_image = EXCLUDED.cover_image,
         logo = EXCLUDED.logo,
         rating = EXCLUDED.rating,
         total_reviews = EXCLUDED.total_reviews,
         delivery_fee = EXCLUDED.delivery_fee,
         minimum_order = EXCLUDED.minimum_order,
         opening_time = EXCLUDED.opening_time,
         closing_time = EXCLUDED.closing_time,
         status = EXCLUDED.status,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         is_active = EXCLUDED.is_active`,
      values
    );
  }

  console.log('[Demo] Seeding User-Restaurant Links...');
  for (const link of userRestaurantLinks) {
    await pool.query(
      `INSERT INTO user_restaurants (user_id, restaurant_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, restaurant_id) DO UPDATE SET role = EXCLUDED.role`,
      [link.user_id, link.restaurant_id, link.role]
    );
  }
}
