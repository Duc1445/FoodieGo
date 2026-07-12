import { MenuItemService } from '../services/menu-item.service.js';
import { successResponse, NotFoundError, AuthorizationError, DomainError } from '@foodiego/core';
import pool from '../../../config/database.js';

const service = new MenuItemService();

export class MenuItemController {
  // Helper to get authorized restaurant ID
  async _getAuthorizedRestaurantId(req, providedRestaurantId) {
    if (req.user.role === 'admin') {
      if (!providedRestaurantId) throw new DomainError('restaurant_id is required for admins');

      // Validate restaurant exists
      const { rows } = await pool.query('SELECT id FROM restaurants WHERE id = $1', [
        providedRestaurantId,
      ]);
      if (rows.length === 0) throw new NotFoundError('Restaurant not found');

      return providedRestaurantId;
    }

    if (req.user.role === 'merchant') {
      const { rows } = await pool.query(
        'SELECT restaurant_id FROM user_restaurants WHERE user_id = $1',
        [req.user.id],
      );
      if (rows.length === 0) throw new AuthorizationError('Merchant has no associated restaurant');
      return rows[0].restaurant_id;
    }

    throw new AuthorizationError('Unauthorized role');
  }

  // Validate global category exists
  async _validateCategory(categoryId) {
    const { rows } = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (rows.length === 0) throw new DomainError('Invalid category_id');
  }

  async getByRestaurantId(req, res, next) {
    try {
      const menu = await service.getMenuByRestaurantId(req.params.id);
      return successResponse(res, menu);
    } catch (err) {
      next(err);
    }
  }

  async getMerchantItems(req, res, next) {
    try {
      const restaurantId = await this._getAuthorizedRestaurantId(req, null);
      const menu = await service.getMenuByRestaurantId(restaurantId);
      return successResponse(res, menu);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const { q, page, limit } = req.query;
      const parsedLimit = limit ? parseInt(limit, 10) : 50;
      const parsedPage = page ? parseInt(page, 10) : 1;
      const offset = (parsedPage - 1) * parsedLimit;

      const menuItems = await service.getAllMenuItems({
        q,
        limit: parsedLimit,
        offset,
      });
      return successResponse(res, menuItems);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const menuItem = await service.getMenuItemById(req.params.id);
      if (!menuItem) {
        throw new NotFoundError('Menu item not found', 'MENU_ITEM_NOT_FOUND', {
          id: req.params.id,
        });
      }
      return successResponse(res, menuItem);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const restaurantId = await this._getAuthorizedRestaurantId(req, req.body.restaurant_id);
      await this._validateCategory(req.body.category_id);

      const newItem = await service.createMenuItem({ ...req.body, restaurant_id: restaurantId });
      res.status(201);
      return successResponse(res, newItem);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Verify item exists and get its category to check ownership
      const existingItem = await service.getMenuItemById(id);
      if (!existingItem) throw new NotFoundError('Menu item not found');

      const restaurantId = await this._getAuthorizedRestaurantId(
        req,
        req.body.restaurant_id || existingItem.restaurant_id,
      );

      if (existingItem.restaurant_id !== restaurantId) {
        throw new AuthorizationError('Not authorized to modify this menu item');
      }

      if (req.body.category_id) {
        await this._validateCategory(req.body.category_id);
      }

      const updatedItem = await service.updateMenuItem(id, req.body, restaurantId);
      return successResponse(res, updatedItem);
    } catch (err) {
      next(err);
    }
  }

  async softDelete(req, res, next) {
    try {
      const { id } = req.params;

      const existingItem = await service.getMenuItemById(id);
      if (!existingItem) throw new NotFoundError('Menu item not found');

      const restaurantId = await this._getAuthorizedRestaurantId(req, existingItem.restaurant_id);

      if (existingItem.restaurant_id !== restaurantId) {
        throw new AuthorizationError('Not authorized to delete this menu item');
      }

      await service.deleteMenuItem(id, restaurantId);
      return successResponse(res, { message: 'Menu item deleted' });
    } catch (err) {
      next(err);
    }
  }
}
