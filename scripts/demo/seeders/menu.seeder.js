import { CategoryMapper, MenuItemMapper } from '../mappers/menu.mapper.js';

export async function seedMenu(pool, categories, menuItems) {
  console.log('[Demo] Seeding Categories...');
  for (const cat of categories) {
    const values = CategoryMapper.toDb(cat);
    await pool.query(
      `INSERT INTO categories (id, name, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name,
         description = EXCLUDED.description`,
      values
    );
  }

  console.log('[Demo] Seeding Menu Items...');
  for (const item of menuItems) {
    const values = MenuItemMapper.toDb(item);
    await pool.query(
      `INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         price = EXCLUDED.price,
         image_url = EXCLUDED.image_url,
         is_available = EXCLUDED.is_available,
         preparation_time = EXCLUDED.preparation_time`,
      values
    );
  }
}
