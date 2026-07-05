import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => {
  return {
    default: {
      query: jest.fn(),
    },
  };
});

const pool = (await import('../config/database.js')).default;
const { FoodModel } = await import('../models/food.model.js');
const { findAll, findById, create, update, remove } = FoodModel;

describe('Food Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findAll - without params should return rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await findAll({});
    expect(res.rows).toEqual([{ id: '1' }]);
  });

  it('findAll - with search and category_id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await findAll({ page: 2, limit: 10, search: 'burger', category_id: 'cat-1' });
    expect(res.rows).toEqual([{ id: '1' }]);
    expect(res.page).toBe(2);
  });

  it('findById - should return first row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await findById('1');
    expect(res).toEqual({ id: '1' });
  });

  it('create - should return created row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await create({ name: 'Food', price: 10, category_id: 'cat-1' });
    expect(res).toEqual({ id: '1' });
  });

  it('update - should return updated row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await update('1', { name: 'Food2' });
    expect(res).toEqual({ id: '1' });
  });

  it('remove - should return true if rowCount > 0', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    const res = await remove('1');
    expect(res).toBe(true);
  });

  it('remove - should return false if rowCount === 0', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    const res = await remove('1');
    expect(res).toBe(false);
  });
});
