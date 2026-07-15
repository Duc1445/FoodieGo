import pool from '../../../config/database.js';
import { RestaurantEntity } from '../entities/restaurant.entity.js';

const DEFAULT_LATITUDE = 16.0544;
const DEFAULT_LONGITUDE = 108.2022;
const DEFAULT_RADIUS_KM = 10;

export class RestaurantRepository {
  async findAll({ page = 1, limit = 20, search = '', lat, lng, radius } = {}) {
    const offset = (page - 1) * limit;
    const filterParams = [];
    const conditions = ["status = 'APPROVED'", 'is_active = true'];
    let selectClause = 'SELECT *';
    let orderClause = 'ORDER BY rating DESC, total_reviews DESC';

    const searchLatitude = Number.isFinite(lat) ? lat : DEFAULT_LATITUDE;
    const searchLongitude = Number.isFinite(lng) ? lng : DEFAULT_LONGITUDE;
    const searchRadius = Number.isFinite(radius) && radius > 0 ? radius : DEFAULT_RADIUS_KM;

    filterParams.push(searchLatitude, searchLongitude, searchRadius);

    const distanceCalc = `(6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude))))`;
    selectClause += `, ${distanceCalc} AS distance`;
    conditions.push(`${distanceCalc} <= $3`);
    orderClause = 'ORDER BY distance ASC, rating DESC, total_reviews DESC';

    if (search) {
      filterParams.push(`%${search}%`);
      conditions.push(`name ILIKE $${filterParams.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const dataParams = [...filterParams, limit, offset];
    const query = `${selectClause} FROM restaurants ${whereClause} ${orderClause} LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`;

    const { rows } = await pool.query(query, dataParams);
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM restaurants ${whereClause}`,
      filterParams,
    );
    const total = countRows[0]?.total || 0;

    // Assign distance directly to entity or plain object
    const items = rows.map((r) => {
      const entity = new RestaurantEntity(r);
      if (r.distance !== undefined) entity.distance = parseFloat(r.distance);
      return entity;
    });

    return { items, total };
  }

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM restaurants WHERE id = $1 AND status = 'APPROVED' AND is_active = true",
      [id],
    );
    if (rows.length === 0) return null;
    return new RestaurantEntity(rows[0]);
  }

  async getAllRestaurants({ page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, name, description, address, district, ward, phone, owner_id, is_active, status, rating, total_reviews, created_at, updated_at
      FROM restaurants
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
  }

  async getPendingRestaurants() {
    const { rows } = await pool.query(`
      SELECT r.*, u.full_name AS owner_name, u.email AS owner_email
      FROM restaurants r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE r.status = 'PENDING'
      ORDER BY r.created_at DESC
    `);
    return rows;
  }

  async approveRestaurant(id) {
    const { rows } = await pool.query(
      `UPDATE restaurants
       SET status = 'APPROVED', updated_at = NOW()
       WHERE id = $1 AND status = 'PENDING'
       RETURNING *`,
      [id],
    );
    return rows[0] || null;
  }

  async rejectRestaurant(id, reason) {
    const { rows } = await pool.query(
      `UPDATE restaurants
       SET status = 'REJECTED', updated_at = NOW()
       WHERE id = $1 AND status = 'PENDING'
       RETURNING *`,
      [id],
    );
    return rows[0] || null;
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
        COUNT(*) AS total_restaurants,
        COUNT(*) FILTER (WHERE is_active = true) AS active_restaurants,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_restaurants,
        COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved_restaurants
      FROM restaurants
    `);
    return rows[0];
  }
}

export const restaurantRepository = new RestaurantRepository();
