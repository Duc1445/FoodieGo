import pool from '../../../config/database.js';

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

export const createUser = async ({
  email,
  password,
  full_name,
  phone,
  address,
  role,
  is_active,
  merchant_status,
}) => {
  const isActiveValue = is_active !== undefined ? is_active : true;
  const mStatus = merchant_status || 'APPROVED';
  
  const result = await pool.query(
    `INSERT INTO users (email, password, full_name, phone, address, role, is_active, merchant_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, email, full_name, phone, address, role, is_active, merchant_status, created_at`,
    [email, password, full_name, phone || null, address || null, role || 'customer', isActiveValue, mStatus],
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

export const getPendingMerchants = async () => {
  const result = await pool.query(
    `SELECT id, email, full_name, phone, address, created_at
     FROM users
     WHERE role = 'merchant' AND merchant_status = 'PENDING'
     ORDER BY created_at ASC`
  );
  return result.rows;
};

export const updateMerchantStatus = async (id, status, reason, adminId) => {
  const result = await pool.query(
    `UPDATE users 
     SET merchant_status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $4 AND role = 'merchant'
     RETURNING id, email, merchant_status, rejection_reason`,
    [status, reason || null, adminId, id]
  );
  return result.rows[0] || null;
};

export const getAllUsers = async ({ role, page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT id, email, full_name, phone, role, merchant_status, rejection_reason, created_at, updated_at
    FROM users
  `;
  const params = [];
  let paramCount = 0;

  if (role) {
    paramCount++;
    query += ` WHERE role = $${paramCount}`;
    params.push(role);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const updateUserRole = async (id, role) => {
  const result = await pool.query(
    `UPDATE users 
     SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, full_name, role, merchant_status, rejection_reason, created_at, updated_at`,
    [role, id]
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id) => {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
};
