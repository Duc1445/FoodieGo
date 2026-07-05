export class CheckoutEntity {
  constructor({ id, user_id, status, total_price, note, address, order_type, created_at, updated_at }) {
    this.id = id;
    this.userId = user_id;
    this.status = status;
    this.totalPrice = total_price;
    this.note = note;
    this.address = address;
    this.orderType = order_type;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}
