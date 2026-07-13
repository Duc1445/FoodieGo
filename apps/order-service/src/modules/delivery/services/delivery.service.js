import * as deliveryRepository from '../repositories/delivery.repository.js';

export const findByOrderId = async (orderId) => {
  return await deliveryRepository.findByOrderId(orderId);
};

export const assignShipper = async (deliveryId, shipperId) => {
  return await deliveryRepository.assignShipper(deliveryId, shipperId);
};

export const updateStatus = async (deliveryId, status) => {
  return await deliveryRepository.updateStatus(deliveryId, status);
};

export const listDeliveries = async ({ status, orderId, driverId, page = 1, limit = 10, sort = 'created_at' }) => {
  const offset = (Math.max(1, page) - 1) * limit;
  return await deliveryRepository.listDeliveries({ status, orderId, driverId, limit, offset, sort });
};
