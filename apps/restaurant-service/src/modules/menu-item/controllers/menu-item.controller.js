import { MenuItemService } from '../services/menu-item.service.js';
import { successResponse, NotFoundError } from '@foodiego/core';

const service = new MenuItemService();

export class MenuItemController {
  async getByRestaurantId(req, res, next) {
    try {
      const menu = await service.getMenuByRestaurantId(req.params.id);
      return successResponse(res, menu);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const menuItems = await service.getAllMenuItems();
      return successResponse(res, menuItems);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const menuItem = await service.getMenuItemById(req.params.id);
      if (!menuItem) {
        throw new NotFoundError('Menu item not found', 'MENU_ITEM_NOT_FOUND', { id: req.params.id });
      }
      return successResponse(res, menuItem);
    } catch (err) {
      next(err);
    }
  }
}
