export class DeliveryEntity {
  constructor({ id, order_id, shipper_id, status, created_at, updated_at }) {
    this.id = id;
    this.orderId = order_id;
    this.shipperId = shipper_id;
    this.status = status;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}
