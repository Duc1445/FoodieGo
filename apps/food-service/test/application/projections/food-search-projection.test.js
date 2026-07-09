import { FoodSearchProjection } from '../../../src/application/projections/food-search.projection.js';
import { FoodProjectionBuilder } from '../../../src/application/projections/food-projection.builder.js';
import { ProjectionConsumer } from '../../../src/application/events/projection-consumer.js';
import { randomUUID } from 'crypto';
import { jest } from '@jest/globals';

describe('Search Projection (CQRS) Tests', () => {
  let mockRepo;
  let builder;
  let consumer;
  let mockIdempotencyStore;
  let state;

  beforeEach(() => {
    state = new Map();
    mockRepo = {
      findById: jest.fn(async (id) => state.get(id)),
      save: jest.fn(async (proj) => { state.set(proj.food_id, proj); })
    };
    mockIdempotencyStore = {
      processed: new Set(),
      isProcessed: jest.fn(async (id) => mockIdempotencyStore.processed.has(id)),
      markProcessed: jest.fn(async (id) => mockIdempotencyStore.processed.add(id))
    };
    builder = new FoodProjectionBuilder(mockRepo);
    consumer = new ProjectionConsumer(builder, mockIdempotencyStore);
  });

  describe('Projection Builder', () => {
    it('should create projection on FoodPublishedV1', async () => {
      const aggregateId = randomUUID();
      const event = {
        eventId: randomUUID(),
        eventType: 'FoodPublishedV1',
        aggregateId,
        aggregateVersion: 1,
        payload: { name: 'Burger', restaurantId: 'r1' }
      };

      await consumer.handle(event);

      const proj = await mockRepo.findById(aggregateId);
      expect(proj).toBeDefined();
      expect(proj.name).toBe('Burger');
      expect(proj.is_available).toBe(true);
      expect(proj.aggregate_version).toBe(1);
    });

    it('should update projection on FoodArchivedV1', async () => {
      const aggregateId = randomUUID();
      state.set(aggregateId, new FoodSearchProjection(aggregateId, 'r1', 1));
      
      const event = {
        eventId: randomUUID(),
        eventType: 'FoodArchivedV1',
        aggregateId,
        aggregateVersion: 2,
        payload: {}
      };

      await consumer.handle(event);

      const proj = await mockRepo.findById(aggregateId);
      expect(proj.is_available).toBe(false);
      expect(proj.aggregate_version).toBe(2);
      expect(proj.projection_version).toBe(2); // increased
    });
  });

  describe('Idempotency & Out-of-order', () => {
    it('should reject out-of-order events (v3 then v2)', async () => {
      const aggregateId = randomUUID();
      const proj = new FoodSearchProjection(aggregateId, 'r1', 3);
      proj.name = 'V3 Name';
      state.set(aggregateId, proj);
      
      const event = {
        eventId: randomUUID(),
        eventType: 'FoodPublishedV1',
        aggregateId,
        aggregateVersion: 2, // Older version!
        payload: { name: 'V2 Name', restaurantId: 'r1' }
      };

      await consumer.handle(event);

      const updatedProj = await mockRepo.findById(aggregateId);
      // Projection should remain at V3
      expect(updatedProj.name).toBe('V3 Name');
      expect(updatedProj.aggregate_version).toBe(3);
    });

    it('should be idempotent (process same event 5 times)', async () => {
      const aggregateId = randomUUID();
      const eventId = randomUUID();
      const event = {
        eventId,
        eventType: 'FoodPublishedV1',
        aggregateId,
        aggregateVersion: 1,
        payload: { name: 'Burger', restaurantId: 'r1' }
      };

      for(let i=0; i<5; i++) {
        await consumer.handle(event);
      }

      expect(mockIdempotencyStore.isProcessed).toHaveBeenCalledTimes(5);
      expect(builder.repository.save).toHaveBeenCalledTimes(1); // Only saved once
    });
  });

  describe('Replay', () => {
    it('should correctly rebuild projection from event stream', async () => {
      const aggregateId = randomUUID();
      const events = [
        { eventId: randomUUID(), eventType: 'FoodPublishedV1', aggregateId, aggregateVersion: 1, payload: { name: 'Burger', restaurantId: 'r1' } },
        { eventId: randomUUID(), eventType: 'VariantAddedV1', aggregateId, aggregateVersion: 2, payload: {} },
        { eventId: randomUUID(), eventType: 'FoodArchivedV1', aggregateId, aggregateVersion: 3, payload: {} },
      ];

      for (const e of events) {
        await consumer.handle(e);
      }

      const proj = await mockRepo.findById(aggregateId);
      expect(proj.aggregate_version).toBe(3);
      expect(proj.is_available).toBe(false);
    });
  });
});
