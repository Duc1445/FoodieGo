export const OrderMapper = {
  toDb: (json) => [
    json.id,
    json.user_id,
    json.restaurant_id,
    json.status,
    json.subtotal,
    json.delivery_fee,
    json.total,
    json.created_at,
  ],
};

export const OrderItemMapper = {
  toDb: (json) => [
    json.id,
    json.order_id,
    json.menu_item_id,
    json.quantity,
    json.name,
    json.unit_price,
    1, // price_version
  ],
};
