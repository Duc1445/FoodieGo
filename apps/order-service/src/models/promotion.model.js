import pool from '../config/database.js';

export const PromotionModel = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT * FROM promotions ORDER BY created_at DESC`
    );
    return rows;
  },

  async create({ code, discount_percentage, is_active }) {
    const { rows } = await pool.query(
      `INSERT INTO promotions (id, code, discount_percentage, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [code, discount_percentage, is_active ?? true]
    );
    return rows[0];
  },

  async update(id, { code, discount_percentage, is_active }) {
    const { rows } = await pool.query(
      `UPDATE promotions
       SET code = COALESCE($1, code),
           discount_percentage = COALESCE($2, discount_percentage),
           is_active = COALESCE($3, is_active)
       WHERE id = $4
       RETURNING *`,
      [code, discount_percentage, is_active, id]
    );
    return rows[0] || null;
  },

  async remove(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM promotions WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
};
