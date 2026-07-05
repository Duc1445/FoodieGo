import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => {
  return {
    default: {
      query: jest.fn(),
    },
  };
});

const pool = (await import('../config/database.js')).default;
const { CategoryModel } = await import('../models/category.model.js');
const { findAll, findById, create, update, remove } = CategoryModel;

describe('Category Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findAll - should return rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await findAll();
    expect(res).toEqual([{ id: '1' }]);
  });

  it('findById - should return first row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await findById('1');
    expect(res).toEqual({ id: '1' });
  });

  it('create - should return created row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await create({ name: 'Cat', description: 'Desc' });
    expect(res).toEqual({ id: '1' });
  });

  it('update - should return updated row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await update('1', { name: 'Cat2' });
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
