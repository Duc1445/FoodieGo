export const DeliveryMapper = {
  toDb: (json) => [
    json.id,
    json.order_id,
    json.driver_id || null,
    json.status,
    json.created_at,
    json.updated_at,
  ],
};
