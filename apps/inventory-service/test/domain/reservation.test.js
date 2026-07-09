import { ReservationAggregate } from '../../src/domain/aggregates/reservation.aggregate.js';

describe('Reservation State Machine', () => {
  it('should reserve successfully from REQUESTED', () => {
    const reservation = new ReservationAggregate('r1', 'o1', []);
    expect(reservation.status).toBe('REQUESTED');
    reservation.reserve();
    expect(reservation.status).toBe('RESERVED');
    expect(reservation.domainEvents[1].type).toBe('InventoryReserved');
  });

  it('should fail successfully from REQUESTED', () => {
    const reservation = new ReservationAggregate('r2', 'o2', []);
    reservation.fail('OUT_OF_STOCK');
    expect(reservation.status).toBe('FAILED');
    expect(reservation.domainEvents[1].payload.reason).toBe('OUT_OF_STOCK');
  });

  it('should throw error on double reserve', () => {
    const reservation = new ReservationAggregate('r3', 'o3', []);
    reservation.reserve();
    expect(() => reservation.reserve()).toThrow('Cannot transition from RESERVED to RESERVED');
  });

  it('should release after reserve', () => {
    const reservation = new ReservationAggregate('r4', 'o4', []);
    reservation.reserve();
    reservation.release();
    expect(reservation.status).toBe('RELEASED');
  });

  it('should throw error if release before reserve', () => {
    const reservation = new ReservationAggregate('r4-1', 'o4-1', []);
    expect(() => reservation.release()).toThrow('Cannot transition from REQUESTED to RELEASED');
  });

  it('should confirm after reserve', () => {
    const reservation = new ReservationAggregate('r5', 'o5', []);
    reservation.reserve();
    reservation.confirm();
    expect(reservation.status).toBe('CONFIRMED');
  });

  it('should throw error if confirm before reserve', () => {
    const reservation = new ReservationAggregate('r5-1', 'o5-1', []);
    expect(() => reservation.confirm()).toThrow('Cannot transition from REQUESTED to CONFIRMED');
  });

  it('should expire reservation', () => {
    const reservation = new ReservationAggregate('r6', 'o6', []);
    reservation.reserve();
    reservation.expire();
    expect(reservation.status).toBe('EXPIRED');
  });
});
