import pool from '../../../config/database.js';
import { RestaurantEntity } from '../entities/restaurant.entity.js';

export class RestaurantRepository {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM restaurants WHERE is_active = true');
    return rows.map(r => new RestaurantEntity(r));
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM restaurants WHERE id = $1 AND is_active = true', [id]);
    if (rows.length === 0) return null;
    return new RestaurantEntity(rows[0]);
  }
}
