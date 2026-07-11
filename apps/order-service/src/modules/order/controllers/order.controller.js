import { OrderService } from '../services/order.service.js';
import { successResponse } from '@foodiego/core';
import { withSpan } from '@foodiego/tracing';

const orderService = new OrderService();

export class OrderController {
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

  async getOrderDetail(req, res, next) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const result = await withSpan('OrderController.getOrderDetail', async (span) => {
        span.setAttribute('order.id', orderId);
        return await orderService.getOrderDetail(orderId, userId);
      });
      return successResponse(res, result, 'Order detail retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const newStatus = req.body.status;

      // TODO:
      // Remove temporary header role override
      // after Merchant Portal RBAC integration.
      const role = req.headers['x-internal-test-role'] || req.user.role;

      const result = await withSpan('OrderController.updateOrderStatus', async (span) => {
        span.setAttribute('order.id', orderId);
        span.setAttribute('order.status_to', newStatus);
        return await orderService.changeOrderStatus(orderId, newStatus, role);
      });

      return successResponse(res, result, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
