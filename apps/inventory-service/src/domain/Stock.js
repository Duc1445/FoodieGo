export class Stock {
  constructor({ stockItemId, totalQuantity, reservedQuantity, version }) {
    this.stockItemId = stockItemId;
    this.totalQuantity = totalQuantity || 0;
    this.reservedQuantity = reservedQuantity || 0;
    this.version = version || 1;
  }

  availableQuantity() {
    return this.totalQuantity - this.reservedQuantity;
  }

  reservedQuantityAmount() {
    return this.reservedQuantity;
  }

  totalQuantityAmount() {
    return this.totalQuantity;
  }

  canReserve(quantity) {
    return this.availableQuantity() >= quantity;
  }

  reserve(quantity) {
    if (!this.canReserve(quantity)) {
      throw new Error(`Insufficient stock for SKU ${this.stockItemId}`);
    }
    this.reservedQuantity += quantity;
    // Note: version increment is handled by the repository during update
  }

  release(quantity) {
    if (this.reservedQuantity < quantity) {
      throw new Error(`Cannot release more than reserved for SKU ${this.stockItemId}`);
    }
    this.reservedQuantity -= quantity;
  }

  confirmDeduction(quantity) {
    if (this.reservedQuantity < quantity) {
      throw new Error(`Cannot confirm more than reserved for SKU ${this.stockItemId}`);
    }
    this.reservedQuantity -= quantity;
    this.totalQuantity -= quantity;
  }
}
