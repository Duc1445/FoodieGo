import pool from '../config/database.js';

export const FoodModel = {
  async findAll({ page = 1, limit = 10, search, category_id } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`f.name ILIKE $${params.length}`);
    }
    if (category_id) {
      params.push(category_id);
      conditions.push(`f.category_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM foods f ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch page
    const dataParams = [...params, limit, offset];
    const { rows } = await pool.query(
      `SELECT f.*, c.name AS category_name
       FROM foods f
       LEFT JOIN categories c ON c.id = f.category_id
       ${where}
       ORDER BY f.created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    return { rows, total, page: Number(page), limit: Number(limit) };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT f.*, c.name AS category_name
       FROM foods f
       LEFT JOIN categories c ON c.id = f.category_id
       WHERE f.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, description, price, image_url, category_id }) {
    const { rows } = await pool.query(
      `INSERT INTO foods (id, name, description, price, image_url, category_id)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, price, image_url || null, category_id || null]
    );
    return rows[0];
  },

  async update(id, { name, description, price, image_url, category_id, is_available }) {
    const { rows } = await pool.query(
      `UPDATE foods
       SET name         = COALESCE($1, name),
           description  = COALESCE($2, description),
           price        = COALESCE($3, price),
           image_url    = COALESCE($4, image_url),
           category_id  = COALESCE($5, category_id),
           is_available = COALESCE($6, is_available),
           updated_at   = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, price, image_url, category_id, is_available, id]
    );
    return rows[0] || null;
  },

  async remove(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM foods WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },
};
