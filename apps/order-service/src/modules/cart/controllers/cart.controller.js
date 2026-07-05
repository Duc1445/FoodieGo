import * as cartService from '../services/cart.service.js';

export const getCart = async (req, res, next) => {
  try {
    const items = await cartService.getCart(req.user.id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { menu_item_id, quantity } = req.body;
    const item = await cartService.addItem(req.user.id, menu_item_id, quantity);
    res.status(201).json({ success: true, message: 'Item added to cart', data: item });
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await cartService.updateItem(req.user.id, req.params.menuItemId, req.body.quantity);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    res.json({ success: true, message: 'Cart item updated', data: item });
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const removed = await cartService.removeItem(req.user.id, req.params.menuItemId);
    if (!removed) return res.status(404).json({ success: false, message: 'Cart item not found' });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};
