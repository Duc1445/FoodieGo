import * as checkoutService from '../services/checkout.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const order = await checkoutService.createOrder(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (err) {
    if (err.message === 'Cart is empty') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await checkoutService.findByUserId(req.user.id);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await checkoutService.findAll();
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await checkoutService.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await checkoutService.updateStatus(req.params.id, req.body.status);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (err) {
    next(err);
  }
};
