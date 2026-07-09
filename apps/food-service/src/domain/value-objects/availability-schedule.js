export class AvailabilitySchedule {
  /**
   * @param {string} dayOfWeek e.g., 'Mon', 'Tue'
   * @param {string} startTime HH:MM format
   * @param {string} endTime HH:MM format
   */
  constructor(dayOfWeek, startTime, endTime) {
    const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (!validDays.includes(dayOfWeek)) {
      throw new Error(`Invalid day of week: ${dayOfWeek}`);
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new Error('Time must be in HH:MM format');
    }

    if (startTime >= endTime) {
      throw new Error('startTime must be before endTime');
    }

    this.dayOfWeek = dayOfWeek;
    this.startTime = startTime;
    this.endTime = endTime;
    Object.freeze(this);
  }

  isAvailableAt(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = days[date.getDay()];
    
    if (currentDay !== this.dayOfWeek) return false;

    const currentHour = date.getHours().toString().padStart(2, '0');
    const currentMinute = date.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    return currentTime >= this.startTime && currentTime <= this.endTime;
  }
}
