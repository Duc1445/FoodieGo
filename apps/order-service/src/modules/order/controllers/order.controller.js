import { OrderService } from '../services/order.service.js';
import { successResponse, NotFoundError, AuthorizationError, DomainError } from '@foodiego/core';
import { withSpan } from '@foodiego/tracing';
import pool from '../../../config/database.js';

const orderService = new OrderService();

export class OrderController {
  // Helper to get authorized restaurant IDs for merchant/admin
  async _getAuthorizedRestaurantIds(req) {
    if (req.user.role === 'admin') {
      return ['ALL']; // Admins have full access
    }

    if (req.user.role === 'merchant') {
      const { rows } = await pool.query(
        'SELECT restaurant_id FROM user_restaurants WHERE user_id = $1',
        [req.user.id],
      );
      if (rows.length === 0) throw new AuthorizationError('Merchant has no associated restaurant');
      return rows.map((r) => r.restaurant_id);
    }

    throw new AuthorizationError('Unauthorized role');
  }

  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await withSpan('OrderController.getUserOrders', async (span) => {
        span.setAttribute('order.user_id', userId);
        return await orderService.getUserOrders(userId);
      });
      return successResponse(res, result, 'Order history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMerchantOrders(req, res, next) {
    try {
      const restaurantIds = await this._getAuthorizedRestaurantIds(req);

      // For MVP, we'll just get orders for the first associated restaurant.
      // In future, we could iterate or support querying specific restaurant.
      let targetRestaurantId = restaurantIds[0];
      if (targetRestaurantId === 'ALL') {
        targetRestaurantId = req.query.restaurant_id;
        if (!targetRestaurantId) throw new DomainError('Admin must specify a restaurant_id');

        // Validate restaurant exists for admin
        const { rows } = await pool.query('SELECT id FROM restaurants WHERE id = $1', [
          targetRestaurantId,
        ]);
        if (rows.length === 0) throw new NotFoundError('Restaurant not found');
      }

      const result = await withSpan('OrderController.getMerchantOrders', async (span) => {
        span.setAttribute('order.restaurant_id', targetRestaurantId);
        return await orderService.getMerchantOrders(targetRestaurantId);
      });
      return successResponse(res, result, 'Merchant orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMerchantStats(req, res, next) {
    try {
      const restaurantIds = await this._getAuthorizedRestaurantIds(req);
      let targetRestaurantId = restaurantIds[0];
      if (targetRestaurantId === 'ALL') {
        targetRestaurantId = req.query.restaurant_id;
        if (!targetRestaurantId) throw new DomainError('Admin must specify a restaurant_id');
      }

      const result = await withSpan('OrderController.getMerchantStats', async (span) => {
        span.setAttribute('order.restaurant_id', targetRestaurantId);
        return await orderService.getMerchantStats(targetRestaurantId);
      });
      return successResponse(res, result, 'Merchant stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetail(req, res, next) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const orderId = req.params.id;

      // For merchants and admins, bypass the user ownership check
      // and instead verify restaurant ownership
      let result;
      if (role === 'merchant' || role === 'admin') {
        const authorizedRestaurantIds = await this._getAuthorizedRestaurantIds(req);
        const order = await orderService.getOrderDetail(orderId, null).catch((err) => {
          console.error('getOrderDetail error:', err);
          return { _error: err.message };
        }); // bypass user id check
        if (!order || order._error)
          throw new NotFoundError('Order not found: ' + (order ? order._error : 'null'));

        if (role !== 'admin' && !authorizedRestaurantIds.includes(order.restaurantId)) {
          throw new AuthorizationError('Not authorized to view this order');
        }
        result = order;
      } else {
        // Customer: check ownership
        result = await withSpan('OrderController.getOrderDetail', async (span) => {
          span.setAttribute('order.id', orderId);
          return await orderService.getOrderDetail(orderId, userId);
        });
      }
      return successResponse(res, result, 'Order detail retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const newStatus = req.body.status;
      const role = req.user.role;

      // Authorize that the merchant owns the restaurant for this order
      const authorizedRestaurantIds = await this._getAuthorizedRestaurantIds(req);

      const order = await orderService.getOrderDetail(orderId, null).catch((err) => {
        console.error('getOrderDetail error:', err);
        return { _error: err.message };
      }); // bypass user id check
      if (!order || order._error)
        throw new NotFoundError('Order not found: ' + (order ? order._error : 'null'));

      if (role !== 'admin' && !authorizedRestaurantIds.includes(order.restaurantId)) {
        throw new AuthorizationError('Not authorized to update this order');
      }

      const context = {
        role,
        actorId: req.user.id,
        actionType: 'MANUAL_UPDATE',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      };

      const result = await withSpan('OrderController.updateOrderStatus', async (span) => {
        span.setAttribute('order.id', orderId);
        span.setAttribute('order.status_to', newStatus);
        return await orderService.changeOrderStatus(orderId, newStatus, context);
      });

      return successResponse(res, result, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
