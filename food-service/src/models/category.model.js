import pool from '../config/database.js';

export const CategoryModel = {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM categories ORDER BY created_at DESC'
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, description, image_url }) {
    const { rows } = await pool.query(
      `INSERT INTO categories (id, name, description, image_url)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [name, description || null, image_url || null]
    );
    return rows[0];
  },

  async update(id, { name, description, image_url, is_active }) {
    const { rows } = await pool.query(
      `UPDATE categories
       SET name       = COALESCE($1, name),
           description = COALESCE($2, description),
           image_url   = COALESCE($3, image_url),
           is_active   = COALESCE($4, is_active),
           updated_at  = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, description, image_url, is_active, id]
    );
    return rows[0] || null;
  },

  async remove(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM categories WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },
};
