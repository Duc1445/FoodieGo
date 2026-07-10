import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => {
  return {
    default: {
      query: jest.fn(),
      connect: jest.fn(),
    },
  };
});

const pool = (await import('../config/database.js')).default;
const { create, findByUserId, findById, updateStatus } = await import('../modules/checkout/repositories/checkout.repository.js');

describe('Order Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findByUserId - should return rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await findByUserId('user-1');
    expect(res).toEqual([{ id: '1' }]);
  });

  it('findById - should return order with items', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] }); // order
    pool.query.mockResolvedValueOnce({ rows: [{ menu_id: 'menu-1' }] }); // items
    const res = await findById('1');
    expect(res).toEqual({ id: '1', items: [{ menu_id: 'menu-1' }] });
  });

  it('findById - should return null if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // order
    const res = await findById('1');
    expect(res).toBeNull();
  });

  it('updateStatus - should return updated row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await updateStatus('1', 'confirmed');
    expect(res).toEqual({ id: '1' });
  });

  it('create - should execute transaction and return order', async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);

    mockClient.query.mockResolvedValueOnce({}); // BEGIN
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: '1', total_price: 100 }] }); // INSERT order
    mockClient.query.mockResolvedValueOnce({}); // INSERT items
    mockClient.query.mockResolvedValueOnce({}); // COMMIT

    const res = await create({
      userId: 'user-1',
      note: 'note',
      address: 'address',
      items: [{ menu_id: 'menu-1', quantity: 2, price: 50 }],
    });

    expect(res).toEqual({ id: '1', total_price: 100 });
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('create - should rollback transaction on error', async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);

    mockClient.query.mockResolvedValueOnce({}); // BEGIN
    mockClient.query.mockRejectedValueOnce(new Error('DB error')); // INSERT order fails

    await expect(
      create({
        userId: 'user-1',
        note: 'note',
        address: 'address',
        items: [{ menu_id: 'menu-1', quantity: 2, price: 50 }],
      })
    ).rejects.toThrow('DB error');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
});
