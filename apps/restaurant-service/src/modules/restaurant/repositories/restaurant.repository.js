import pool from '../../../config/database.js';
import { RestaurantEntity } from '../entities/restaurant.entity.js';

export class RestaurantRepository {
  async findAll({ page = 1, limit = 20, search = '' } = {}) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM restaurants WHERE is_active = true';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $1`;
    }

    query += ` ORDER BY rating DESC, total_reviews DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows.map(r => new RestaurantEntity(r));
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM restaurants WHERE id = $1 AND is_active = true', [id]);
    if (rows.length === 0) return null;
    return new RestaurantEntity(rows[0]);
  }
}
