import * as deliveryService from '../services/delivery.service.js';

export const getDeliveryByOrder = async (req, res, next) => {
  try {
    const delivery = await deliveryService.findByOrderId(req.params.orderId);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
};

export const acceptDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.assignShipper(req.params.id, req.user.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, message: 'Delivery accepted', data: delivery });
  } catch (err) {
    next(err);
  }
};

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const delivery = await deliveryService.updateStatus(req.params.id, req.body.status);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, message: 'Delivery status updated', data: delivery });
  } catch (err) {
    next(err);
  }
};

export const listDeliveries = async (req, res, next) => {
  try {
    const { status, orderId, driverId, page, limit, sort } = req.query;
    const limitInt = limit ? parseInt(limit, 10) : 10;
    const pageInt = page ? parseInt(page, 10) : 1;
    
    const deliveries = await deliveryService.listDeliveries({
      status,
      orderId,
      driverId,
      page: pageInt,
      limit: limitInt,
      sort
    });
    
    res.json({ success: true, data: deliveries });
  } catch (err) {
    next(err);
  }
};
