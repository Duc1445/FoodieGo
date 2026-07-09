import { randomUUID } from 'crypto';

export class CategoryAggregate {
  /**
   * @param {string} id 
   * @param {string} menuId 
   * @param {string} name 
   * @param {string|null} parentCategoryId 
   */
  constructor(id, menuId, name, parentCategoryId = null) {
    this.id = id || randomUUID();
    this.menuId = menuId;
    this.name = name;
    this.parentCategoryId = parentCategoryId;

    if (this.id === this.parentCategoryId) {
      throw new Error('Category cannot reference itself as parent');
    }

    this.domainEvents = [];
  }

  updateName(newName) {
    this.name = newName;
  }

  pullDomainEvents() {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
