import { MenuRepository } from '../repositories/menu.repository.js';
import redis from '../../../config/redis.js';

export class MenuService {
  constructor() {
    this.menuRepository = new MenuRepository();
  }

  async clearMenuCache() {
    const keys = await redis.keys('menus:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async getMenus({ page, limit, search, category_id }) {
    const cacheKey = `menus:${page || 1}:${limit || 10}:${search || ''}:${category_id || ''}`;
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
    const cacheKey = `menu:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const menu = await this.menuRepository.findById(id);
    if (menu) {
      await redis.set(cacheKey, JSON.stringify(menu), 'EX', 3600);
    }
    return menu;
  }

  async createMenu(data) {
    const menu = await this.menuRepository.create(data);
    await this.clearMenuCache();
    return menu;
  }

  async updateMenu(id, data) {
    const menu = await this.menuRepository.update(id, data);
    if (menu) {
      await this.clearMenuCache();
      await redis.del(`menu:${id}`);
    }
    return menu;
  }

  async deleteMenu(id) {
    const success = await this.menuRepository.remove(id);
    if (success) {
      await this.clearMenuCache();
      await redis.del(`menu:${id}`);
    }
    return success;
  }
}
