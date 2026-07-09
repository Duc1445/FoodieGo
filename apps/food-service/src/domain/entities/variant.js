import { randomUUID } from 'crypto';

export class Variant {
  /**
   * @param {string} id
   * @param {string} sku
   * @param {string} name
   * @param {import('../value-objects/price-snapshot.js').PriceSnapshot[]} prices
   * @param {import('./option-group.js').OptionGroup[]} optionGroups
   */
  constructor(id, sku, name, prices = [], optionGroups = []) {
    this.id = id || randomUUID();
    this.sku = sku;
    if (!this.sku) throw new Error('Variant must have an SKU');
    this.name = name;
    this.prices = prices;
    this.optionGroups = optionGroups;
  }

  addPriceSnapshot(snapshot) {
    // Check for overlapping price snapshots
    const overlapping = this.prices.some(p => {
      // Logic for overlap detection
      if (!p.effectiveTo && !snapshot.effectiveTo) return true;
      if (!p.effectiveTo && snapshot.effectiveTo) return snapshot.effectiveTo > p.effectiveFrom;
      if (p.effectiveTo && !snapshot.effectiveTo) return p.effectiveTo > snapshot.effectiveFrom;
      return Math.max(p.effectiveFrom, snapshot.effectiveFrom) < Math.min(p.effectiveTo, snapshot.effectiveTo);
    });

    if (overlapping) {
      throw new Error('Price snapshots cannot overlap in time');
    }

    this.prices.push(snapshot);
  }

  addOptionGroup(optionGroup) {
    this.optionGroups.push(optionGroup);
  }
}
