export const CategoryMapper = {
  toDb: (json) => [
    json.id,
    json.name,
    json.description || null,
  ],
};

export const MenuItemMapper = {
  toDb: (json) => [
    json.id,
    json.restaurant_id,
    json.category_id,
    json.name,
    json.description || null,
    json.price,
    json.image_url || null,
    json.is_available !== undefined ? json.is_available : true,
    json.preparation_time || 15,
  ],
};
