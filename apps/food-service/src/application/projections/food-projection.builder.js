import { FoodSearchProjection } from './food-search.projection.js';

export class FoodProjectionBuilder {
  constructor(projectionRepository) {
    this.repository = projectionRepository;
  }

  /**
   * Applies an integration event to build/update the projection
   * @param {object} event 
   */
  async build(event) {
    const { eventType, eventVersion, aggregateId, payload, aggregateVersion } = event;
    
    // Load existing projection or create new
    let projectionData = await this.repository.findById(aggregateId);
    let projection;

    if (!projectionData) {
      if (eventType === 'FoodPublishedV1') {
        projection = new FoodSearchProjection(aggregateId, payload.restaurantId, aggregateVersion || 1);
      } else {
        // If projection doesn't exist and event is not Published/Created, we can either:
        // 1. Create a dummy skeleton to hold future data
        // 2. Ignore
        // For CQRS robust replay, we often create a skeleton:
        projection = new FoodSearchProjection(aggregateId, payload.restaurantId || 'unknown', aggregateVersion || 1);
      }
    } else {
      projection = new FoodSearchProjection(
        projectionData.food_id,
        projectionData.restaurant_id,
        projectionData.aggregate_version
      );
      Object.assign(projection, projectionData);
    }

    let updated = false;

    // Apply logic based on event type
    switch (eventType) {
      case 'FoodPublishedV1':
        updated = projection.update({
          is_available: true,
          // Extract basic details from payload if it contained them (in real world, payload would have name, desc)
          name: payload.name || projection.name,
        }, aggregateVersion || 1);
        break;
      case 'VariantAddedV1':
        // Update price_min / price_max if necessary, requires domain logic in payload
        updated = projection.update({
          // example update
        }, aggregateVersion || 1);
        break;
      case 'FoodArchivedV1':
        updated = projection.update({
          is_available: false
        }, aggregateVersion || 1);
        break;
    }

    if (updated) {
      await this.repository.save(projection);
    }
  }
}
