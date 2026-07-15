import * as deliveryService from '../services/delivery.service.js';

const mapDeliveryToCamelCase = (d) => ({
  id: d.id,
  orderId: d.order_id,
  driverId: d.driver_id,
  status: d.status,
  deliveryFee: d.delivery_fee,
  total: d.total,
  customerId: d.customer_id,
  customerName: d.customer_name,
  customerPhone: d.customer_phone,
  customerAddress: d.customer_address,
  restaurantName: d.restaurant_name,
  restaurantAddress: d.restaurant_address,
  restaurantPhone: d.restaurant_phone,
  restaurantLat: d.restaurant_lat,
  restaurantLng: d.restaurant_lng,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

export const getDeliveryByOrder = async (req, res, next) => {
  try {
    const delivery = await deliveryService.findByOrderId(req.params.orderId);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({ success: true, data: mapDeliveryToCamelCase(delivery) });
  } catch (err) {
    next(err);
  }
};

export const acceptDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.assignDriver(req.params.id, req.user.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({
      success: true,
      message: 'Delivery accepted',
      data: mapDeliveryToCamelCase(delivery),
    });
  } catch (err) {
    next(err);
  }
};

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const context = {
      role: 'driver',
      actorId: req.user.id,
      actionType: 'DELIVERY_UPDATE',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    };
    const delivery = await deliveryService.updateStatus(req.params.id, req.body.status, context);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
    res.json({
      success: true,
      message: 'Delivery status updated',
      data: mapDeliveryToCamelCase(delivery),
    });
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
      sort,
    });

    res.json({ success: true, data: deliveries.map(mapDeliveryToCamelCase) });
  } catch (err) {
    next(err);
  }
};

export const getDriverStats = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const stats = await deliveryService.getDriverStats(driverId);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
