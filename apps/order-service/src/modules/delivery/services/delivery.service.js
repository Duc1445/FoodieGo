import * as deliveryRepository from '../repositories/delivery.repository.js';
import { OrderService } from '../../order/services/order.service.js';

const orderService = new OrderService();

export const findByOrderId = async (orderId) => {
  return await deliveryRepository.findByOrderId(orderId);
};

export const assignDriver = async (deliveryId, driverId) => {
  const delivery = await deliveryRepository.assignDriver(deliveryId, driverId);
  return delivery;
};

export const updateStatus = async (deliveryId, status) => {
  const delivery = await deliveryRepository.updateStatus(deliveryId, status);
  if (delivery && delivery.order_id) {
    if (status === 'delivering') {
      await orderService.changeOrderStatus(delivery.order_id, 'DELIVERING', 'system').catch(console.error);
    } else if (status === 'delivered') {
      await orderService.changeOrderStatus(delivery.order_id, 'COMPLETED', 'system').catch(console.error);
    }
  }
  return delivery;
};

export const listDeliveries = async ({ status, orderId, driverId, page = 1, limit = 10, sort = 'created_at' }) => {
  const offset = (Math.max(1, page) - 1) * limit;
  return await deliveryRepository.listDeliveries({ status, orderId, driverId, limit, offset, sort });
};
