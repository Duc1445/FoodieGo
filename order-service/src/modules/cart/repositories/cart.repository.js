import pool from '../../../config/database.js';

export const getCart = async (userId) => {
  const { rows } = await pool.query(
    `SELECT ci.user_id, ci.menu_id, ci.quantity,
            f.name AS menu_name, f.price AS menu_price
     FROM cart_items ci
     JOIN menus f ON f.id = ci.menu_id
     WHERE ci.user_id = $1`,
    [userId]
  );
  return rows;
};

export const addItem = async (userId, menuId, quantity) => {
  const { rows } = await pool.query(
    `INSERT INTO cart_items (user_id, menu_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, menu_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [userId, menuId, quantity]
  );
  return rows[0];
};

export const updateItem = async (userId, menuId, quantity) => {
  const { rows } = await pool.query(
    `UPDATE cart_items SET quantity = $3
     WHERE user_id = $1 AND menu_id = $2
     RETURNING *`,
    [userId, menuId, quantity]
  );
  return rows[0];
};

export const removeItem = async (userId, menuId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM cart_items WHERE user_id = $1 AND menu_id = $2`,
    [userId, menuId]
  );
  return rowCount > 0;
};

export const clearCart = async (userId, client) => {
  const executor = client || pool;
  await executor.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
};
