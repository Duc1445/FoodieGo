import { PriceSnapshot } from '../../src/domain/value-objects/price-snapshot.js';
import { AvailabilitySchedule } from '../../src/domain/value-objects/availability-schedule.js';
import { Variant } from '../../src/domain/entities/variant.js';
import { OptionGroup, Option } from '../../src/domain/entities/option-group.js';
import { CategoryAggregate } from '../../src/domain/aggregates/category.aggregate.js';
import { FoodAggregate } from '../../src/domain/aggregates/food.aggregate.js';

describe('Aggregate Invariants & Property Tests', () => {
  describe('PriceSnapshot', () => {
    it('should not allow negative price', () => {
      expect(() => new PriceSnapshot(-10, 'USD', new Date())).toThrow('Price amount cannot be negative');
    });

    it('should not allow effectiveTo before effectiveFrom', () => {
      const from = new Date('2026-01-02');
      const to = new Date('2026-01-01');
      expect(() => new PriceSnapshot(100, 'USD', from, to)).toThrow('effectiveTo must be after effectiveFrom');
    });
  });

  describe('Variant', () => {
    it('should not allow overlapping price snapshots', () => {
      const variant = new Variant('v1', 'SKU-001', 'Test Variant');
      const p1 = new PriceSnapshot(100, 'USD', new Date('2026-01-01'), new Date('2026-01-10'));
      const p2 = new PriceSnapshot(120, 'USD', new Date('2026-01-05'), new Date('2026-01-15'));
      
      variant.addPriceSnapshot(p1);
      expect(() => variant.addPriceSnapshot(p2)).toThrow('Price snapshots cannot overlap in time');
    });

    it('must have an SKU', () => {
      expect(() => new Variant('v2', null, 'Test')).toThrow('Variant must have an SKU');
    });
  });

  describe('FoodAggregate', () => {
    it('should not allow duplicate SKUs among variants', () => {
      const food = new FoodAggregate('f1', 'r1', 'Burger', 'Delicious', 'c1');
      const v1 = new Variant('v1', 'SKU-123', 'Small');
      const v2 = new Variant('v2', 'SKU-123', 'Large'); // duplicate sku

      food.addVariant(v1);
      expect(() => food.addVariant(v2)).toThrow('Variant with SKU SKU-123 already exists in this Food item');
    });

    it('must have at least one variant to be published', () => {
      const food = new FoodAggregate('f2', 'r1', 'Fries', 'Crispy', 'c1');
      expect(() => food.publish()).toThrow('Food must have at least one variant to be published');
    });
  });

  describe('Category', () => {
    it('should not allow referencing itself as parent', () => {
      expect(() => new CategoryAggregate('cat1', 'menu1', 'Food', 'cat1')).toThrow('Category cannot reference itself as parent');
    });
  });

  describe('OptionGroup', () => {
    it('should require minSelections >= 1 if isRequired is true', () => {
      expect(() => new OptionGroup('og1', 'Size', true, 0, 1)).toThrow('Required option group must have minSelections >= 1');
    });
    
    it('should require maxSelections >= minSelections', () => {
      expect(() => new OptionGroup('og2', 'Extras', false, 2, 1)).toThrow('maxSelections must be greater than or equal to minSelections');
    });
  });

  describe('AvailabilitySchedule', () => {
    it('should not allow invalid time formats', () => {
      expect(() => new AvailabilitySchedule('Mon', '25:00', '10:00')).toThrow('Time must be in HH:MM format');
    });
    
    it('should not allow startTime >= endTime', () => {
      expect(() => new AvailabilitySchedule('Mon', '12:00', '10:00')).toThrow('startTime must be before endTime');
    });
  });
});
