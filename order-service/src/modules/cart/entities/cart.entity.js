export class CartEntity {
  constructor({ user_id, menu_id, quantity, menu_name, menu_price }) {
    this.userId = user_id;
    this.menuId = menu_id;
    this.quantity = quantity;
    this.foodName = menu_name;
    this.foodPrice = menu_price;
  }
}
