import pool from '../../config/database.js';

/**
 * Get all cart items for a user, joined with foods table for price/name.
 */
export const getCart = async (userId) => {
  const { rows } = await pool.query(
    `SELECT ci.user_id, ci.food_id, ci.quantity,
            f.name AS food_name, f.price AS food_price
     FROM cart_items ci
     JOIN foods f ON f.id = ci.food_id
     WHERE ci.user_id = $1`,
    [userId]
  );
  return rows;
};

/**
 * Add an item to the cart (upsert — increments quantity if already exists).
 */
export const addItem = async (userId, foodId, quantity) => {
  const { rows } = await pool.query(
    `INSERT INTO cart_items (user_id, food_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, food_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [userId, foodId, quantity]
  );
  return rows[0];
};

/**
 * Update the quantity of a specific item in the cart.
 */
export const updateItem = async (userId, foodId, quantity) => {
  const { rows } = await pool.query(
    `UPDATE cart_items SET quantity = $3
     WHERE user_id = $1 AND food_id = $2
     RETURNING *`,
    [userId, foodId, quantity]
  );
  return rows[0];
};

/**
 * Remove a specific item from the cart.
 */
export const removeItem = async (userId, foodId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM cart_items WHERE user_id = $1 AND food_id = $2`,
    [userId, foodId]
  );
  return rowCount > 0;
};

/**
 * Clear all items from a user's cart.
 */
export const clearCart = async (userId, client) => {
  const executor = client || pool;
  await executor.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
};
