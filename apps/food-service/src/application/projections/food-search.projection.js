export class FoodSearchProjection {
  /**
   * @param {string} foodId
   * @param {string} restaurantId
   * @param {number} aggregateVersion
   */
  constructor(foodId, restaurantId, aggregateVersion) {
    this.food_id = foodId;
    this.restaurant_id = restaurantId;
    this.aggregate_version = aggregateVersion;
    this.projection_version = 1;

    // Searchable fields
    this.category_id = null;
    this.name = '';
    this.normalized_name = '';
    this.description = '';
    this.tags = [];
    
    // Aggregated data
    this.price_min = null;
    this.price_max = null;
    this.rating = 0.0;
    this.review_count = 0;
    
    // Status and Geospatial/Vector
    this.is_available = false;
    this.location = null; // GeoJSON point
    this.search_vector = null; // for tsvector
    this.embedding = null; // for pgvector
    
    this.updated_at = new Date();
  }

  update(fields, newAggregateVersion) {
    if (newAggregateVersion < this.aggregate_version) {
      // Out of order event or replay of older event
      return false;
    }

    Object.assign(this, fields);
    this.aggregate_version = newAggregateVersion;
    this.projection_version++;
    this.updated_at = new Date();
    return true;
  }
}
