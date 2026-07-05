import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => {
  return {
    default: {
      query: jest.fn(),
    },
  };
});

const pool = (await import('../config/database.js')).default;
const { getCart, addItem, updateItem, removeItem, clearCart } = await import('../modules/cart/repositories/cart.repository.js');

describe('Cart Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCart - should return rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ food_id: '1' }] });
    const res = await getCart('user-1');
    expect(res).toEqual([{ food_id: '1' }]);
  });

  it('addItem - should return created row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ food_id: '1' }] });
    const res = await addItem('user-1', '1', 2);
    expect(res).toEqual({ food_id: '1' });
  });

  it('updateItem - should return updated row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ food_id: '1' }] });
    const res = await updateItem('user-1', '1', 5);
    expect(res).toEqual({ food_id: '1' });
  });

  it('removeItem - should return true if rowCount > 0', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    const res = await removeItem('user-1', '1');
    expect(res).toBe(true);
  });

  it('clearCart - should resolve', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    const res = await clearCart('user-1');
    expect(res).toBeUndefined();
  });
});
