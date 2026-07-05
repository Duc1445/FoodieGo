import * as cartRepository from '../repositories/cart.repository.js';

export const getCart = async (userId) => {
  return await cartRepository.getCart(userId);
};

export const addItem = async (userId, foodId, quantity) => {
  return await cartRepository.addItem(userId, foodId, quantity);
};

export const updateItem = async (userId, foodId, quantity) => {
  return await cartRepository.updateItem(userId, foodId, quantity);
};

export const removeItem = async (userId, foodId) => {
  return await cartRepository.removeItem(userId, foodId);
};
