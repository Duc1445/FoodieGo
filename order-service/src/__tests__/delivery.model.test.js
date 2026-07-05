import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => {
  return {
    default: {
      query: jest.fn(),
    },
  };
});

const pool = (await import('../config/database.js')).default;
const { findByOrderId, updateStatus, assignShipper } = await import('../models/delivery.model.js');

describe('Delivery Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findByOrderId - should return first row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await findByOrderId('order-1');
    expect(res).toEqual({ id: '1' });
  });

  it('updateStatus - should return updated row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await updateStatus('1', 'delivering');
    expect(res).toEqual({ id: '1' });
  });

  it('assignShipper - should return updated row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await assignShipper('1', 'shipper-1');
    expect(res).toEqual({ id: '1' });
  });
});
