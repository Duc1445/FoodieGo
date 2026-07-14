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
  approval_status,
  business_name,
  business_license,
  tax_code,
  identity_card,
  driver_license,
  vehicle_type,
  vehicle_plate,
  avatar_url,
  restaurant_images,
}) => {
  const isActiveValue = is_active !== undefined ? is_active : true;
  const mStatus = approval_status || 'APPROVED';

  const result = await pool.query(
    `INSERT INTO users (
      email, password, full_name, phone, address, role, is_active, approval_status,
      business_name, business_license, tax_code, identity_card, driver_license, vehicle_type, vehicle_plate, avatar_url, restaurant_images
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING id, email, full_name, phone, address, role, is_active, approval_status, created_at`,
    [
      email,
      password,
      full_name,
      phone || null,
      address || null,
      role || 'customer',
      isActiveValue,
      mStatus,
      business_name || null,
      business_license || null,
      tax_code || null,
      identity_card || null,
      driver_license || null,
      vehicle_type || null,
      vehicle_plate || null,
      avatar_url || null,
      restaurant_images || null,
    ],
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

export const getPendingUsers = async (role) => {
  let query = `
     SELECT id, email, full_name, phone, address, role, approval_status, created_at,
            business_name, business_license, tax_code, 
            identity_card, driver_license, vehicle_type, vehicle_plate, avatar_url
     FROM users
     WHERE approval_status = 'PENDING' AND role IN ('merchant', 'driver', 'driver')
  `;
  const params = [];

  if (role) {
    query += ` AND role = $1`;
    params.push(role);
  }

  query += ` ORDER BY created_at ASC`;
  const result = await pool.query(query, params);
  return result.rows;
};

export const updateUserStatus = async (id, status, reason, adminId) => {
  const result = await pool.query(
    `UPDATE users 
     SET approval_status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $4
     RETURNING id, email, role, approval_status, rejection_reason`,
    [status, reason || null, adminId, id],
  );
  return result.rows[0] || null;
};

export const getAllUsers = async ({
  role,
  approval_status = 'APPROVED',
  page = 1,
  limit = 50,
} = {}) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT id, email, full_name, phone, address, role, approval_status, rejection_reason, created_at, updated_at,
           business_name, business_license, tax_code, 
           identity_card, driver_license, vehicle_type, vehicle_plate, avatar_url
    FROM users
    WHERE approval_status = $1
  `;
  const params = [approval_status];
  let paramCount = 1;

  if (role) {
    paramCount++;
    query += ` AND role = $${paramCount}`;
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
     RETURNING id, email, full_name, role, approval_status, rejection_reason, created_at, updated_at`,
    [role, id],
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
};

export const getUserStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS total_users,
      COUNT(*) FILTER (WHERE role = 'customer') AS total_customers,
      COUNT(*) FILTER (WHERE role = 'merchant') AS total_merchants,
      COUNT(*) FILTER (WHERE role = 'driver')  AS total_drivers,
      COUNT(*) FILTER (WHERE role = 'admin')    AS total_admins,
      COUNT(*) FILTER (WHERE role = 'merchant' AND approval_status = 'PENDING') AS pending_merchants,
      COUNT(*) FILTER (WHERE role = 'merchant' AND approval_status = 'APPROVED') AS approved_merchants,
      COUNT(*) FILTER (WHERE role = 'driver' AND approval_status = 'PENDING') AS pending_drivers,
      COUNT(*) FILTER (WHERE role = 'driver' AND approval_status = 'APPROVED') AS approved_drivers,
      COUNT(*) FILTER (WHERE approval_status = 'REJECTED') AS rejected_applications,
      COUNT(*) FILTER (WHERE is_active = false) AS suspended_users
    FROM users
  `);
  return rows[0];
};
