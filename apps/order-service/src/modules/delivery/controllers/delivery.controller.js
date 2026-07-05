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
