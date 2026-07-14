import pool from '../../../config/database.js';
import { MenuItemEntity } from '../entities/menu-item.entity.js';

export class MenuItemRepository {
  async findByRestaurantIdGroupByCategory(restaurantId) {
    const query = `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        c.display_order AS category_order,
        m.id AS menu_item_id,
        m.name AS menu_item_name,
        m.description,
        m.price,
        m.image_url,
        m.is_available,
        m.display_order AS menu_item_order
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.restaurant_id = $1 AND m.is_active = true
      ORDER BY c.display_order ASC, m.display_order ASC
    `;
    const { rows } = await pool.query(query, [restaurantId]);

    // Grouping logic
    const categoriesMap = new Map();
    rows.forEach((row) => {
      if (!categoriesMap.has(row.category_id)) {
        categoriesMap.set(row.category_id, {
          id: row.category_id,
          name: row.category_name,
          display_order: row.category_order,
          items: [],
        });
      }
      if (row.menu_item_id) {
        categoriesMap.get(row.category_id).items.push({
          id: row.menu_item_id,
          name: row.menu_item_name,
          description: row.description,
          price: parseFloat(row.price),
          image_url: row.image_url,
          is_available: row.is_available,
          display_order: row.menu_item_order,
        });
      }
    });

    return Array.from(categoriesMap.values());
  }

  async findAll({ q = '', limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM menu_items WHERE is_available = true AND is_active = true';
    const params = [];

    if (q) {
      query += ` AND (name ILIKE $1 OR description ILIKE $1)`;
      params.push(`%${q}%`);
    }

    query += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows.map((r) => new MenuItemEntity(r));
  }

  async findById(id) {
    const query = `
      SELECT m.*, c.name as category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.id = $1 AND m.is_active = true
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return { ...new MenuItemEntity(rows[0]), restaurant_id: rows[0].restaurant_id };
  }

  async create(data) {
    const query = `
      INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `;
    const params = [
      data.restaurant_id,
      data.category_id,
      data.name,
      data.description || null,
      data.price,
      data.image_url || null,
      data.is_available !== undefined ? data.is_available : true,
      data.display_order || 0,
    ];
    const { rows } = await pool.query(query, params);
    return new MenuItemEntity(rows[0]);
  }

  async update(id, data) {
    const fields = [];
    const params = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (
        [
          'name',
          'description',
          'price',
          'image_url',
          'is_available',
          'display_order',
          'category_id',
        ].includes(key)
      ) {
        fields.push(`${key} = $${idx++}`);
        params.push(value);
      }
    }

    if (fields.length === 0) return await this.findById(id);

    params.push(id);
    const query = `
      UPDATE menu_items 
      SET ${fields.join(', ')} 
      WHERE id = $${idx} AND is_active = true
      RETURNING *
    `;

    const { rows } = await pool.query(query, params);
    if (rows.length === 0) return null;
    return new MenuItemEntity(rows[0]);
  }

  async softDelete(id) {
    const query = `
      UPDATE menu_items 
      SET is_active = false 
      WHERE id = $1 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return new MenuItemEntity(rows[0]);
  }
}
