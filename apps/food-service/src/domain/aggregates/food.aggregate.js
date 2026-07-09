import { randomUUID } from 'crypto';

export class FoodAggregate {
  /**
   * @param {string} id
   * @param {string} restaurantId
   * @param {string} name
   * @param {string} description
   * @param {string} categoryId
   * @param {string[]} mediaIds
   * @param {import('../entities/variant.js').Variant[]} variants
   * @param {import('../value-objects/availability-schedule.js').AvailabilitySchedule[]} schedules
   */
  constructor(id, restaurantId, name, description, categoryId, mediaIds = [], variants = [], schedules = []) {
    this.id = id || randomUUID();
    this.restaurantId = restaurantId;
    this.name = name;
    this.description = description;
    this.categoryId = categoryId;
    this.mediaIds = mediaIds;
    this.variants = variants;
    this.schedules = schedules;
    
    this.status = 'DRAFT'; // DRAFT, PUBLISHED, ARCHIVED
    this.aggregateVersion = 1;
    this.domainEvents = [];
  }

  incrementVersion() {
    this.aggregateVersion++;
  }

  addVariant(variant) {
    if (this.variants.some(v => v.sku === variant.sku)) {
      throw new Error(`Variant with SKU ${variant.sku} already exists in this Food item`);
    }
    this.variants.push(variant);
    this.incrementVersion();
    this.domainEvents.push({
      type: 'VariantAdded',
      aggregateVersion: this.aggregateVersion,
      payload: { foodId: this.id, variantId: variant.id, sku: variant.sku, timestamp: new Date() }
    });
  }

  addMedia(mediaId) {
    if (!this.mediaIds.includes(mediaId)) {
      this.mediaIds.push(mediaId);
      this.incrementVersion();
      this.domainEvents.push({
        type: 'MediaAdded',
        aggregateVersion: this.aggregateVersion,
        payload: { foodId: this.id, mediaId, timestamp: new Date() }
      });
    }
  }

  publish() {
    if (this.variants.length === 0) {
      throw new Error('Food must have at least one variant to be published');
    }
    this.status = 'PUBLISHED';
    this.incrementVersion();
    this.domainEvents.push({
      type: 'FoodPublished',
      aggregateVersion: this.aggregateVersion,
      payload: { id: this.id, restaurantId: this.restaurantId, timestamp: new Date() }
    });
  }

  pullDomainEvents() {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
