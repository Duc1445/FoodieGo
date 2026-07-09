import { InventoryBusinessConsumer } from '../../src/application/events/business-consumer.js';
import { ReservationAggregate } from '../../src/domain/aggregates/reservation.aggregate.js';
import { jest } from '@jest/globals';

describe('Inventory Compensation Tests', () => {
  it('should release inventory when RestaurantRejectedV1 occurs', async () => {
    const reservation = new ReservationAggregate('r1', 'o1', []);
    reservation.reserve(); // RESERVED
    
    const mockRepo = {
      findByOrderId: jest.fn().mockResolvedValue(reservation),
      save: jest.fn()
    };
    
    const mockIdempotency = {
      isProcessed: jest.fn().mockResolvedValue(false),
      markProcessed: jest.fn()
    };
    
    const consumer = new InventoryBusinessConsumer(mockRepo, mockIdempotency);
    
    await consumer.handle({
      eventId: 'evt1',
      eventType: 'RestaurantRejectedV1',
      payload: { orderId: 'o1' }
    });
    
    expect(mockRepo.findByOrderId).toHaveBeenCalledWith('o1');
    expect(reservation.status).toBe('RELEASED');
    expect(mockRepo.save).toHaveBeenCalledWith(reservation);
    expect(mockIdempotency.markProcessed).toHaveBeenCalledWith('evt1');
  });
});
