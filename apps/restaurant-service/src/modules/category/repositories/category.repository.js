import pool from '../../../config/database.js';
import { CategoryEntity } from '../entities/category.entity.js';

export class CategoryRepository {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    return rows.map((row) => new CategoryEntity(row));
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows[0] ? new CategoryEntity(rows[0]) : null;
  }

  async create({ name }) {
    const { rows } = await pool.query(
      `INSERT INTO categories (id, name)
       VALUES (gen_random_uuid(), $1)
       RETURNING *`,
      [name],
    );
    return new CategoryEntity(rows[0]);
  }

  async update(id, { name, is_active }) {
    const { rows } = await pool.query(
      `UPDATE categories
       SET name       = COALESCE($1, name),
           is_active   = COALESCE($2, is_active),
           updated_at  = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, is_active, id],
    );
    return rows[0] ? new CategoryEntity(rows[0]) : null;
  }

  async remove(id) {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return rowCount > 0;
  }
}
