export class RestaurantEntity {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.cover_image = data.cover_image;
    this.logo = data.logo;
    this.rating = data.rating;
    this.total_reviews = data.total_reviews;
    this.delivery_fee = data.delivery_fee;
    this.minimum_order = data.minimum_order;
    this.opening_time = data.opening_time;
    this.closing_time = data.closing_time;
    this.status = data.status;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
