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
      FROM categories c
      LEFT JOIN menu_items m ON c.id = m.category_id AND m.is_available = true
      WHERE c.restaurant_id = $1 AND c.is_active = true
      ORDER BY c.display_order ASC, m.display_order ASC
    `;
    const { rows } = await pool.query(query, [restaurantId]);
    
    // Grouping logic
    const categoriesMap = new Map();
    rows.forEach(row => {
      if (!categoriesMap.has(row.category_id)) {
        categoriesMap.set(row.category_id, {
          id: row.category_id,
          name: row.category_name,
          display_order: row.category_order,
          items: []
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
          display_order: row.menu_item_order
        });
      }
    });

    return Array.from(categoriesMap.values());
  }

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM menu_items');
    return rows.map(r => new MenuItemEntity(r));
  }

  async findById(id) {
    const query = `
      SELECT m.*, c.restaurant_id, c.name as category_name
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return { ...new MenuItemEntity(rows[0]), restaurant_id: rows[0].restaurant_id };
  }
}
