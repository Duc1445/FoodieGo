import pool from '../../../config/database.js';
import { MenuItemEntity } from '../entities/menuItem.entity.js';

export class MenuItemRepository {
  async findAll({ page = 1, limit = 10, search, category_id } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`m.name ILIKE $${params.length}`);
    }
    if (category_id) {
      params.push(category_id);
      conditions.push(`m.category_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM menu_items m ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataParams = [...params, limit, offset];
    const { rows } = await pool.query(
      `SELECT m.*, c.name AS category_name
       FROM menu_items m
       LEFT JOIN categories c ON c.id = m.category_id
       ${where}
       ORDER BY m.created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    return { 
      rows: rows.map(row => new MenuItemEntity(row)), 
      total, 
      page: Number(page), 
      limit: Number(limit) 
    };
  }

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT m.*, c.name AS category_name
       FROM menu_items m
       LEFT JOIN categories c ON c.id = m.category_id
       WHERE m.id = $1`,
      [id]
    );
    return rows[0] ? new MenuItemEntity(rows[0]) : null;
  }

  async create({ name, description, price, image_url, category_id }) {
    const { rows } = await pool.query(
      `INSERT INTO menu_items (id, name, description, price, image_url, category_id)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, price, image_url || null, category_id || null]
    );
    return new MenuItemEntity(rows[0]);
  }

  async update(id, { name, description, price, image_url, category_id, is_available }) {
    const { rows } = await pool.query(
      `UPDATE menu_items
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
    return rows[0] ? new MenuItemEntity(rows[0]) : null;
  }

  async remove(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM menu_items WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
}
