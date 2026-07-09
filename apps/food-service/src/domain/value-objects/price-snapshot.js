export class PriceSnapshot {
  /**
   * @param {number} amount 
   * @param {string} currency 
   * @param {Date} effectiveFrom 
   * @param {Date|null} effectiveTo 
   */
  constructor(amount, currency, effectiveFrom, effectiveTo = null) {
    if (amount < 0) {
      throw new Error('Price amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO code');
    }
    if (effectiveTo && effectiveFrom >= effectiveTo) {
      throw new Error('effectiveTo must be after effectiveFrom');
    }

    this.amount = amount;
    this.currency = currency.toUpperCase();
    this.effectiveFrom = effectiveFrom;
    this.effectiveTo = effectiveTo;
    Object.freeze(this);
  }

  isEffectiveAt(date) {
    if (date < this.effectiveFrom) return false;
    if (this.effectiveTo && date >= this.effectiveTo) return false;
    return true;
  }
}
