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
