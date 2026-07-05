import * as cartRepository from '../repositories/cart.repository.js';

export const getCart = async (userId) => {
  return await cartRepository.getCart(userId);
};

export const addItem = async (userId, menuItemId, quantity) => {
  return await cartRepository.addItem(userId, menuItemId, quantity);
};

export const updateItem = async (userId, menuItemId, quantity) => {
  return await cartRepository.updateItem(userId, menuItemId, quantity);
};

export const removeItem = async (userId, menuItemId) => {
  return await cartRepository.removeItem(userId, menuItemId);
};
