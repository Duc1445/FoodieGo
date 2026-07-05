import { MenuItemRepository } from '../repositories/menu-item.repository.js';
import redis from '../../../config/redis.js';
import { config } from '@foodiego/core';

const repository = new MenuItemRepository();

export class MenuItemService {
  async getMenuByRestaurantId(restaurantId) {
    const cacheKey = `restaurant:${restaurantId}:menu`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const menu = await repository.findByRestaurantIdGroupByCategory(restaurantId);
    await redis.set(cacheKey, JSON.stringify(menu), 'EX', config.redis.ttl);
    return menu;
  }

  async getAllMenuItems() {
    return await repository.findAll();
  }

  async getMenuItemById(id) {
    const cacheKey = `menu_item:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const menuItem = await repository.findById(id);
    if (menuItem) {
      await redis.set(cacheKey, JSON.stringify(menuItem), 'EX', config.redis.ttl);
    }
    return menuItem;
  }
}
