export const RestaurantMapper = {
  toDb: (json) => [
    json.id,
    json.name,
    json.description || null,
    json.cover_image || null,
    json.logo || null,
    json.rating || 0,
    json.total_reviews || 0,
    json.delivery_fee || 0,
    json.minimum_order || 0,
    json.opening_time || '00:00',
    json.closing_time || '23:59',
    json.status || 'open',
    json.latitude || 0,
    json.longitude || 0,
    json.is_active !== undefined ? json.is_active : true,
  ],
};
