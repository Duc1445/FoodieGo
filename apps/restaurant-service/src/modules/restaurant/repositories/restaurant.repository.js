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
    return rows.map((r) => new RestaurantEntity(r));
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1 AND is_active = true',
      [id],
    );
    if (rows.length === 0) return null;
    return new RestaurantEntity(rows[0]);
  }

  async getAllRestaurants({ page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, name, description, address, district, ward, phone, owner_id, is_active, rating, total_reviews, created_at, updated_at
      FROM restaurants
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
  }

  async toggleRestaurantStatus(id) {
    const { rows } = await pool.query(
      `UPDATE restaurants 
       SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, is_active, rating, total_reviews, owner_id, created_at, updated_at`,
      [id],
    );
    return rows[0] || null;
  }

  async getStats() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                              AS total_restaurants,
        COUNT(*) FILTER (WHERE is_active = true) AS active_restaurants
      FROM restaurants
    `);
    return rows[0];
  }
}

export const restaurantRepository = new RestaurantRepository();
