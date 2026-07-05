import { MenuItemRepository } from '../repositories/menu-item.repository.js';
const repository = new MenuItemRepository();

export class MenuItemService {
  async getMenuByRestaurantId(restaurantId) {
    return await repository.findByRestaurantIdGroupByCategory(restaurantId);
  }

  async getAllMenuItems() {
    return await repository.findAll();
  }

  async getMenuItemById(id) {
    return await repository.findById(id);
  }
}
