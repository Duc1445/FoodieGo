import pool from '../config/database.js';

export const PromotionModel = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT p.*, r.name AS restaurant_name
       FROM promotions p
       LEFT JOIN restaurants r ON p.restaurant_id = r.id
       ORDER BY p.created_at DESC`,
    );
    return rows;
  },

  async findPendingMerchantVouchers() {
    const { rows } = await pool.query(
      `SELECT p.*, r.name AS restaurant_name
       FROM promotions p
       LEFT JOIN restaurants r ON p.restaurant_id = r.id
       WHERE p.promotion_type = 'merchant' AND p.approval_status = 'PENDING'
       ORDER BY p.created_at DESC`,
    );
    return rows;
  },

  async findByRestaurant(restaurantId) {
    const { rows } = await pool.query(
      `SELECT * FROM promotions
       WHERE restaurant_id = $1 AND promotion_type = 'merchant'
       ORDER BY created_at DESC`,
      [restaurantId],
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(`SELECT * FROM promotions WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async findByCode(code) {
    const { rows } = await pool.query(`SELECT * FROM promotions WHERE code = $1`, [code]);
    return rows[0] || null;
  },

  async findActiveForRestaurant(restaurantId) {
    const { rows } = await pool.query(
      `SELECT * FROM promotions
       WHERE is_active = true
       AND approval_status = 'APPROVED'
       AND (valid_from IS NULL OR valid_from <= NOW())
       AND (valid_until IS NULL OR valid_until >= NOW())
       AND (usage_limit IS NULL OR usage_count < usage_limit)
       AND (
         promotion_type = 'platform'
         OR (promotion_type = 'merchant' AND restaurant_id = $1)
       )
       ORDER BY created_at DESC`,
      [restaurantId],
    );
    return rows;
  },

  async findActive() {
    const { rows } = await pool.query(
      `SELECT * FROM promotions
       WHERE is_active = true
       AND approval_status = 'APPROVED'
       AND promotion_type = 'platform'
       AND (valid_from IS NULL OR valid_from <= NOW())
       AND (valid_until IS NULL OR valid_until >= NOW())
       AND (usage_limit IS NULL OR usage_count < usage_limit)
       ORDER BY created_at DESC`,
    );
    return rows;
  },

  async create(data) {
    const {
      code,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_value,
      usage_limit,
      valid_from,
      valid_until,
      is_active,
      promotion_type = 'platform',
      restaurant_id = null,
      approval_status = 'APPROVED',
    } = data;

    const { rows } = await pool.query(
      `INSERT INTO promotions (
         id, code, discount_type, discount_value, min_order_value, max_discount_value,
         usage_limit, valid_from, valid_until, is_active, promotion_type, restaurant_id, approval_status
       )
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        code,
        discount_type || 'percentage',
        discount_value,
        min_order_value || 0,
        max_discount_value || null,
        usage_limit || null,
        valid_from || null,
        valid_until || null,
        is_active ?? true,
        promotion_type,
        restaurant_id || null,
        approval_status,
      ],
    );
    return rows[0];
  },

  async update(id, data) {
    const {
      code,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_value,
      usage_limit,
      valid_from,
      valid_until,
      is_active,
    } = data;

    const { rows } = await pool.query(
      `UPDATE promotions
       SET code = COALESCE($1, code),
           discount_type = COALESCE($2, discount_type),
           discount_value = COALESCE($3, discount_value),
           min_order_value = COALESCE($4, min_order_value),
           max_discount_value = COALESCE($5, max_discount_value),
           usage_limit = COALESCE($6, usage_limit),
           valid_from = COALESCE($7, valid_from),
           valid_until = COALESCE($8, valid_until),
           is_active = COALESCE($9, is_active),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        code,
        discount_type,
        discount_value,
        min_order_value,
        max_discount_value || null,
        usage_limit || null,
        valid_from || null,
        valid_until || null,
        is_active,
        id,
      ],
    );
    return rows[0] || null;
  },

  async approve(id) {
    const { rows } = await pool.query(
      `UPDATE promotions
       SET approval_status = 'APPROVED',
           is_active = true,
           rejection_reason = NULL,
           updated_at = NOW()
       WHERE id = $1 AND promotion_type = 'merchant'
       RETURNING *`,
      [id],
    );
    return rows[0] || null;
  },

  async reject(id, reason) {
    const { rows } = await pool.query(
      `UPDATE promotions
       SET approval_status = 'REJECTED',
           is_active = false,
           rejection_reason = $2,
           updated_at = NOW()
       WHERE id = $1 AND promotion_type = 'merchant'
       RETURNING *`,
      [id, reason],
    );
    return rows[0] || null;
  },

  async incrementUsage(id) {
    const { rows } = await pool.query(
      `UPDATE promotions
       SET usage_count = usage_count + 1,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );
    return rows[0] || null;
  },

  async recordUsage({ promotion_id, user_id, order_id, discount_value }) {
    const { rows } = await pool.query(
      `INSERT INTO promotion_usages (promotion_id, user_id, order_id, discount_value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [promotion_id, user_id, order_id, discount_value],
    );
    return rows[0];
  },

  async remove(id) {
    const { rowCount } = await pool.query('DELETE FROM promotions WHERE id = $1', [id]);
    return rowCount > 0;
  },
};
