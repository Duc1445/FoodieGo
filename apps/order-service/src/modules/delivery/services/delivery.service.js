import * as deliveryRepository from '../repositories/delivery.repository.js';
import { OrderService } from '../../order/services/order.service.js';

const orderService = new OrderService();

export const findByOrderId = async (orderId) => {
  return await deliveryRepository.findByOrderId(orderId);
};

export const assignDriver = async (deliveryId, driverId) => {
  const delivery = await deliveryRepository.assignDriver(deliveryId, driverId);
  if (delivery && delivery.order_id) {
    await orderService
      .changeOrderStatus(delivery.order_id, 'DRIVER_ACCEPTED', {})
      .catch(console.error);
  }
  return delivery;
};

export const updateStatus = async (deliveryId, status, context = {}) => {
  const delivery = await deliveryRepository.updateStatus(deliveryId, status);
  if (delivery && delivery.order_id) {
    if (status === 'picked_up') {
      await orderService
        .changeOrderStatus(delivery.order_id, 'PICKED_UP', context)
        .catch(console.error);
    } else if (status === 'delivering') {
      await orderService
        .changeOrderStatus(delivery.order_id, 'DELIVERING', context)
        .catch(console.error);
    } else if (status === 'delivered') {
      await orderService
        .changeOrderStatus(delivery.order_id, 'COMPLETED', context)
        .catch(console.error);
    }
  }
  return delivery;
};

export const listDeliveries = async ({
  status,
  orderId,
  driverId,
  page = 1,
  limit = 10,
  sort = 'created_at',
}) => {
  const offset = (Math.max(1, page) - 1) * limit;
  return await deliveryRepository.listDeliveries({
    status,
    orderId,
    driverId,
    limit,
    offset,
    sort,
  });
};

export const getDriverStats = async (driverId) => {
  return await deliveryRepository.getDriverStats(driverId);
};
