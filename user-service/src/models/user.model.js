import pool from '../config/database.js';

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, email, full_name, phone, address, role, is_active, created_at FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] || null;
};

export const createUser = async ({ email, password, full_name, phone, address, role }) => {
  const result = await pool.query(
    `INSERT INTO users (email, password, full_name, phone, address, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, full_name, phone, address, role, created_at`,
    [email, password, full_name, phone || null, address || null, role || 'customer'],
  );
  return result.rows[0];
};

export const updateUser = async (id, { full_name, phone, address }) => {
  const result = await pool.query(
    `UPDATE users SET full_name = $1, phone = $2, address = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id, email, full_name, phone, address, role, updated_at`,
    [full_name, phone, address, id],
  );
  return result.rows[0] || null;
};
