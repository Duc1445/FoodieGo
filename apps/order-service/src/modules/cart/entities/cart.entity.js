export class CartEntity {
  constructor({ user_id, food_id, quantity, food_name, food_price }) {
    this.userId = user_id;
    this.foodId = food_id;
    this.quantity = quantity;
    this.foodName = food_name;
    this.foodPrice = food_price;
  }
}
