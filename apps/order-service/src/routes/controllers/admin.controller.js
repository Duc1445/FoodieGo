import * as orderRepository from '../../modules/order/repositories/order.repository.js';

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const orders = await orderRepository.getAllOrders({
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await orderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await orderRepository.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
