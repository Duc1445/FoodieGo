import pool from '../../../config/database.js';

export const create = async (reviewData) => {
  const { userId, restaurantId, orderId, rating, comment } = reviewData;
  const { rows } = await pool.query(
    `INSERT INTO reviews (user_id, restaurant_id, order_id, rating, comment, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
     RETURNING *`,
    [userId, restaurantId, orderId, rating, comment]
  );
  return rows[0];
};

export const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM reviews WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const findByOrderId = async (orderId) => {
  const { rows } = await pool.query(
    `SELECT * FROM reviews WHERE order_id = $1`,
    [orderId]
  );
  return rows[0] || null;
};

export const findByRestaurantId = async (restaurantId, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options;
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `SELECT * FROM reviews 
     WHERE restaurant_id = $1 AND is_active = true
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT $2 OFFSET $3`,
    [restaurantId, limit, offset]
  );
  return rows;
};

export const findByUserId = async (userId, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options;
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `SELECT * FROM reviews 
     WHERE user_id = $1 AND is_active = true
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

export const update = async (id, updateData) => {
  const { rating, comment, isActive } = updateData;
  const { rows } = await pool.query(
    `UPDATE reviews 
     SET rating = COALESCE($1, rating),
         comment = COALESCE($2, comment),
         is_active = COALESCE($3, is_active),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [rating, comment, isActive, id]
  );
  return rows[0] || null;
};

export const softDelete = async (id) => {
  const { rows } = await pool.query(
    `UPDATE reviews SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

export const deleteById = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM reviews WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

export const getAverageRating = async (restaurantId) => {
  const { rows } = await pool.query(
    `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
     FROM reviews
     WHERE restaurant_id = $1 AND is_active = true`,
    [restaurantId]
  );
  return rows[0] || { avg_rating: 0, total_reviews: 0 };
};
