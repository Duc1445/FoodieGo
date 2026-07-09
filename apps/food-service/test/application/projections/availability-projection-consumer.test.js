import { AvailabilityProjectionConsumer } from '../../../src/application/events/availability-projection-consumer.js';
import { FoodAvailabilityProjection } from '../../../src/application/projections/food-availability.projection.js';
import { jest } from '@jest/globals';

describe('Availability Projection Consumer Tests', () => {
  let mockRepo;
  let mockIdempotencyStore;
  let consumer;
  let state;

  beforeEach(() => {
    state = new Map();
    mockRepo = {
      findById: jest.fn(async (id) => state.get(id)),
      save: jest.fn(async (proj) => { state.set(proj.foodId, proj); })
    };
    mockIdempotencyStore = {
      processed: new Set(),
      isProcessed: jest.fn(async (id) => mockIdempotencyStore.processed.has(id)),
      markProcessed: jest.fn(async (id) => mockIdempotencyStore.processed.add(id))
    };
    consumer = new AvailabilityProjectionConsumer(mockRepo, mockIdempotencyStore);
  });

  describe('Idempotency & Out-of-order', () => {
    it('should be idempotent (process same event 10 times)', async () => {
      const eventId = 'evt-idempotent';
      const event = {
        eventId,
        eventType: 'InventoryReservedV1',
        aggregateVersion: 1,
        payload: {
          items: [{ foodId: 'f1', variantId: 'v1', quantity: 2 }]
        }
      };

      for(let i = 0; i < 10; i++) {
        await consumer.handle(event);
      }

      expect(mockIdempotencyStore.isProcessed).toHaveBeenCalledTimes(10);
      expect(mockRepo.save).toHaveBeenCalledTimes(1); // Only saved once
    });

    it('should reject out-of-order events (older version arriving later)', async () => {
      const foodId = 'f2';
      const proj = new FoodAvailabilityProjection(foodId);
      proj.aggregateVersion = 5;
      proj.inventoryStatus = 'OUT_OF_STOCK';
      state.set(foodId, proj);
      
      const event = {
        eventId: 'evt-ooo',
        eventType: 'InventoryReservedV1',
        aggregateVersion: 3, // Older version!
        payload: { items: [{ foodId }] }
      };

      await consumer.handle(event);

      const updatedProj = await mockRepo.findById(foodId);
      // Projection should remain at V5
      expect(updatedProj.inventoryStatus).toBe('OUT_OF_STOCK');
      expect(updatedProj.aggregateVersion).toBe(5);
    });
  });

  describe('Replay', () => {
    it('should correctly rebuild projection from event stream without side effects', async () => {
      const foodId = 'f3';
      const events = [
        { eventId: 'r1', eventType: 'InventoryReservedV1', aggregateVersion: 1, payload: { items: [{ foodId }] } },
        { eventId: 'r2', eventType: 'InventoryReservationFailedV1', aggregateVersion: 2, payload: { reason: 'OUT_OF_STOCK', items: [{ foodId }] } },
      ];

      for (const e of events) {
        await consumer.handle(e);
      }

      const proj = await mockRepo.findById(foodId);
      expect(proj.aggregateVersion).toBe(2);
      expect(proj.isAvailable).toBe(false);
      expect(proj.inventoryStatus).toBe('OUT_OF_STOCK');
    });
  });
});
