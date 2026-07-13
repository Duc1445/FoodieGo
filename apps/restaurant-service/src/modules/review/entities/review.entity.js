export class ReviewEntity {
  constructor({ id, user_id, restaurant_id, order_id, rating, comment, is_active, created_at, updated_at }) {
    this.id = id;
    this.userId = user_id;
    this.restaurantId = restaurant_id;
    this.orderId = order_id;
    this.rating = rating;
    this.comment = comment;
    this.isActive = is_active;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}
