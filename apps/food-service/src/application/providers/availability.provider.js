/**
 * Interface for abstracting availability lookups.
 * In Epic 5 (Media) and Epic 6 (AI), the Search API will use this provider
 * to determine if a Food item is currently available, without depending directly
 * on the Inventory service or internal implementations.
 */
export class AvailabilityProvider {
  /**
   * Retrieves the current availability status of a food item.
   * @param {string} foodId
   * @returns {Promise<{
   *   isAvailable: boolean,
   *   isSellable: boolean,
   *   inventoryStatus: string, // e.g., 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
   * }>}
   */
  async getAvailability(foodId) {
    throw new Error('Method not implemented.');
  }

  /**
   * Optional: Retrieves availability for a batch of items.
   * @param {string[]} foodIds 
   */
  async getAvailabilityBatch(foodIds) {
    throw new Error('Method not implemented.');
  }
}
