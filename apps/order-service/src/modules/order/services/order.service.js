import { OrderRepository } from '../repositories/order.repository.js';
import { NotFoundError, AuthorizationError, ValidationError } from '@foodiego/core';
import { OrderStateMachine } from '../../checkout/state/order.state.js';

const orderRepository = new OrderRepository();

export class OrderService {
  async getUserOrders(userId) {
    return await orderRepository.findOrdersByUserId(userId);
  }

  async getOrderDetail(orderId, userId) {
    const order = await orderRepository.findOrderDetailById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Customer data isolation
    if (order.userId !== userId) {
      throw new AuthorizationError('Access denied to this order');
    }

    return order;
  }

  async changeOrderStatus(orderId, newStatus, role) {
    if (role !== 'merchant' && role !== 'admin') {
      throw new AuthorizationError('Only merchants and admins can update order status');
    }

    const order = await orderRepository.findOrderDetailById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const stateMachine = new OrderStateMachine(order.status);

    try {
      stateMachine.transitionTo(newStatus);
    } catch (err) {
      throw new ValidationError(err.message); // 400 Bad Request
    }

    const updated = await orderRepository.updateOrderStatus(orderId, newStatus);
    return updated;
  }
}
