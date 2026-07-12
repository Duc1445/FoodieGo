import { CartService } from '../services/cart.service.js';
import { successResponse } from '@foodiego/core';

const cartService = new CartService();

export class CartController {
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const traceId = req.headers['x-trace-id'] || 'trace-mock';
      const cart = await cartService.getCart(userId, traceId);
      return successResponse(res, cart, 'Cart retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const userId = req.user?.id;
      console.log('--- ADD ITEM: userId ---', userId, req.user);
      const traceId = req.headers['x-trace-id'] || 'trace-mock';
      const { menu_item_id, quantity } = req.body;
      const cart = await cartService.addItem(userId, menu_item_id, quantity, traceId);
      return successResponse(res, cart, 'Item added to cart', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateItemQuantity(req, res, next) {
    try {
      const userId = req.user.id;
      const traceId = req.headers['x-trace-id'] || 'trace-mock';
      const { id: menu_item_id } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(userId, menu_item_id, quantity, traceId);
      return successResponse(res, cart, 'Cart item updated');
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const userId = req.user.id;
      const traceId = req.headers['x-trace-id'] || 'trace-mock';
      const { id: menu_item_id } = req.params;
      const cart = await cartService.removeItem(userId, menu_item_id, traceId);
      return successResponse(res, cart, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      const traceId = req.headers['x-trace-id'] || 'trace-mock';
      await cartService.clearCart(userId, traceId);
      return successResponse(res, null, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }
}
