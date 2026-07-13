import pool from '../config/database.js';

export const PromotionModel = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT * FROM promotions ORDER BY created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM promotions WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByCode(code) {
    const { rows } = await pool.query(
      `SELECT * FROM promotions WHERE code = $1`,
      [code]
    );
    return rows[0] || null;
  },

  async findActive() {
    const { rows } = await pool.query(
      `SELECT * FROM promotions 
       WHERE is_active = true 
       AND (valid_from IS NULL OR valid_from <= NOW())
       AND (valid_until IS NULL OR valid_until >= NOW())
       AND (usage_limit IS NULL OR usage_count < usage_limit)
       ORDER BY created_at DESC`
    );
    return rows;
  },

  async create({ code, discount_type, discount_value, min_order_value, max_discount_value, usage_limit, valid_from, valid_until, is_active }) {
    const { rows } = await pool.query(
      `INSERT INTO promotions (id, code, discount_type, discount_value, min_order_value, max_discount_value, usage_limit, valid_from, valid_until, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [code, discount_type || 'percentage', discount_value, min_order_value || 0, max_discount_value, usage_limit, valid_from, valid_until, is_active ?? true]
    );
    return rows[0];
  },

  async update(id, { code, discount_type, discount_value, min_order_value, max_discount_value, usage_limit, valid_from, valid_until, is_active }) {
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
      [code, discount_type, discount_value, min_order_value, max_discount_value, usage_limit, valid_from, valid_until, is_active, id]
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
      [id]
    );
    return rows[0] || null;
  },

  async recordUsage({ promotion_id, user_id, order_id, discount_value }) {
    const { rows } = await pool.query(
      `INSERT INTO promotion_usages (promotion_id, user_id, order_id, discount_value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [promotion_id, user_id, order_id, discount_value]
    );
    return rows[0];
  },

  async remove(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM promotions WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
};
