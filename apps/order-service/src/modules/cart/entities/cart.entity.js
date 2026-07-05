export class CartEntity {
  constructor({ user_id, menu_item_id, quantity, menuItem_name, menuItem_price }) {
    this.userId = user_id;
    this.menuItemId = menu_item_id;
    this.quantity = quantity;
    this.menuItemName = menuItem_name;
    this.menuItemPrice = menuItem_price;
  }
}
