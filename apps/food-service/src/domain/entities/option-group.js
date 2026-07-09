import { randomUUID } from 'crypto';

export class Option {
  /**
   * @param {string} id
   * @param {string} name
   * @param {number} priceDelta
   */
  constructor(id, name, priceDelta = 0) {
    this.id = id || randomUUID();
    this.name = name;
    this.priceDelta = priceDelta;
  }
}

export class OptionGroup {
  /**
   * @param {string} id
   * @param {string} name
   * @param {boolean} isRequired
   * @param {number} minSelections
   * @param {number} maxSelections
   * @param {Option[]} options
   */
  constructor(id, name, isRequired, minSelections, maxSelections, options = []) {
    this.id = id || randomUUID();
    this.name = name;
    this.isRequired = isRequired;
    this.minSelections = minSelections;
    this.maxSelections = maxSelections;
    this.options = options;

    if (isRequired && minSelections < 1) {
      throw new Error('Required option group must have minSelections >= 1');
    }
    
    if (maxSelections < minSelections) {
      throw new Error('maxSelections must be greater than or equal to minSelections');
    }
  }

  addOption(option) {
    this.options.push(option);
  }
}
