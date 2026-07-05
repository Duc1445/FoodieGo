import { MenuItemRepository } from '../repositories/menuItem.repository.js';
import redis from '../../../config/redis.js';

export class MenuItemService {
  constructor() {
    this.menuRepository = new MenuItemRepository();
  }

  async clearMenuCache() {
    const keys = await redis.keys('menu_items:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async getMenus({ page, limit, search, category_id }) {
    const cacheKey = `menu_items:${page || 1}:${limit || 10}:${search || ''}:${category_id || ''}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await this.menuRepository.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      category_id,
    });

    const responseData = {
      data: result.rows,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };

    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 3600);
    return responseData;
  }

  async getMenuById(id) {
    const cacheKey = `menuItem:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const menuItem = await this.menuRepository.findById(id);
    if (menuItem) {
      await redis.set(cacheKey, JSON.stringify(menuItem), 'EX', 3600);
    }
    return menuItem;
  }

  async createMenu(data) {
    const menuItem = await this.menuRepository.create(data);
    await this.clearMenuCache();
    return menuItem;
  }

  async updateMenu(id, data) {
    const menuItem = await this.menuRepository.update(id, data);
    if (menuItem) {
      await this.clearMenuCache();
      await redis.del(`menuItem:${id}`);
    }
    return menuItem;
  }

  async deleteMenu(id) {
    const success = await this.menuRepository.remove(id);
    if (success) {
      await this.clearMenuCache();
      await redis.del(`menuItem:${id}`);
    }
    return success;
  }
}
