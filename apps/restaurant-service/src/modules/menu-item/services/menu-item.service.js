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
    await redis.set(cacheKey, JSON.stringify(menu), 'EX', 3600);
    return menu;
  }

  async getAllMenuItems(query = {}) {
    return await repository.findAll(query);
  }

  async getMenuItemById(id) {
    const cacheKey = `menu_item:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const menuItem = await repository.findById(id);
    if (menuItem) {
      await redis.set(cacheKey, JSON.stringify(menuItem), 'EX', 3600);
    }
    return menuItem;
  }

  async createMenuItem(data) {
    const menuItem = await repository.create(data);
    await this.clearRestaurantMenuCache(data.restaurant_id); // Needs restaurant_id to clear cache properly
    return menuItem;
  }

  async updateMenuItem(id, data, restaurantId) {
    const menuItem = await repository.update(id, data);
    if (menuItem) {
      await redis.del(`menu_item:${id}`);
      if (restaurantId) await this.clearRestaurantMenuCache(restaurantId);
    }
    return menuItem;
  }

  async deleteMenuItem(id, restaurantId) {
    const menuItem = await repository.softDelete(id);
    if (menuItem) {
      await redis.del(`menu_item:${id}`);
      if (restaurantId) await this.clearRestaurantMenuCache(restaurantId);
    }
    return menuItem;
  }

  async clearRestaurantMenuCache(restaurantId) {
    if (restaurantId) {
      await redis.del(`restaurant:${restaurantId}:menu`);
    }
  }
}
