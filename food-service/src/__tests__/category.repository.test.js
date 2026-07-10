import { jest } from '@jest/globals';
import pool from '../config/database.js';
import { CategoryRepository } from '../modules/category/repositories/category.repository.js';

jest.unstable_mockModule('../config/database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

const repo = new CategoryRepository();

describe('Category Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findAll - should return rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await repo.findAll();
    expect(res).toEqual([{ id: '1' }]);
  });

  it('findById - should return first row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await repo.findById('1');
    expect(res).toEqual({ id: '1' });
  });

  it('create - should return created row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await repo.create({ name: 'Cat' });
    expect(res).toEqual({ id: '1' });
  });

  it('update - should return updated row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });
    const res = await repo.update('1', { name: 'Cat2' });
    expect(res).toEqual({ id: '1' });
  });

  it('remove - should return true if rowCount > 0', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    const res = await repo.remove('1');
    expect(res).toBe(true);
  });

  it('remove - should return false if rowCount === 0', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    const res = await repo.remove('1');
    expect(res).toBe(false);
  });
});
