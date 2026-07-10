import * as cartRepository from '../repositories/cart.repository.js';

export const getCart = async (userId) => {
  return await cartRepository.getCart(userId);
};

export const addItem = async (userId, menuId, quantity) => {
  return await cartRepository.addItem(userId, menuId, quantity);
};

export const updateItem = async (userId, menuId, quantity) => {
  return await cartRepository.updateItem(userId, menuId, quantity);
};

export const removeItem = async (userId, menuId) => {
  return await cartRepository.removeItem(userId, menuId);
};
