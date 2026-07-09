export class FoodAvailabilityProjection {
  /**
   * @param {string} foodId 
   */
  constructor(foodId) {
    this.foodId = foodId;
    this.isAvailable = false;
    this.isSellable = false;
    this.inventoryStatus = 'UNKNOWN'; // e.g., 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
    this.aggregateVersion = 0; // Tracks the version of the event that updated this projection
    this.updatedAt = new Date();
  }

  /**
   * @param {object} fields 
   * @param {number} newVersion 
   * @returns {boolean} true if updated, false if out of order
   */
  update(fields, newVersion) {
    if (newVersion < this.aggregateVersion) {
      // Out of order or replay of older event
      return false;
    }
    
    // For idempotency, if version is same, we might still apply it if it's identical, 
    // but the idempotency store in the consumer should catch duplicate eventIds.
    
    Object.assign(this, fields);
    this.aggregateVersion = newVersion;
    this.updatedAt = new Date();
    return true;
  }
}
