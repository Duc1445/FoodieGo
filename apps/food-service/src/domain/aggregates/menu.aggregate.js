import { randomUUID } from 'crypto';

export class MenuAggregate {
  /**
   * @param {string} id 
   * @param {string} restaurantId 
   * @param {string} name 
   * @param {string} description 
   * @param {import('../value-objects/availability-schedule.js').AvailabilitySchedule[]} schedules
   */
  constructor(id, restaurantId, name, description, schedules = []) {
    this.id = id || randomUUID();
    this.restaurantId = restaurantId;
    this.name = name;
    this.description = description;
    this.schedules = schedules;
    
    this.status = 'ACTIVE';
    this.domainEvents = [];
  }

  addSchedule(schedule) {
    this.schedules.push(schedule);
  }

  pullDomainEvents() {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
