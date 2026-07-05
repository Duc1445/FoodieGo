import * as checkoutRepository from '../repositories/checkout.repository.js';
import * as cartRepository from '../../cart/repositories/cart.repository.js';
import * as deliveryRepository from '../../delivery/repositories/delivery.repository.js';

export const createOrder = async (userId, data) => {
  let items = [];
  if (data.cart && data.cart.length > 0) {
    items = data.cart.map(c => ({
      menu_item_id: c.menu_item_id || c.id,
      quantity: c.quantity,
      price: c.price,
    }));
  } else {
    const cartItems = await cartRepository.getCart(userId);
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }
    items = cartItems.map((ci) => ({
      menu_item_id: ci.menu_item_id,
      quantity: ci.quantity,
      price: ci.menuItem_price,
    }));
  }

  const order = await checkoutRepository.create({
    userId,
    note: data.note,
    address: data.address,
    orderType: data.order_type || 'takeaway',
    items,
  });

  await deliveryRepository.create(order.id);
  await cartRepository.clearCart(userId);

  return order;
};

export const findByUserId = async (userId) => {
  return await checkoutRepository.findByUserId(userId);
};

export const findAll = async () => {
  return await checkoutRepository.findAll();
};

export const findById = async (orderId) => {
  return await checkoutRepository.findById(orderId);
};

export const updateStatus = async (orderId, status) => {
  return await checkoutRepository.updateStatus(orderId, status);
};
