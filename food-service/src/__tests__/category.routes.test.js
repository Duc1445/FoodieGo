import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => {
  return {
    default: {
      query: jest.fn(),
      on: jest.fn(),
    },
  };
});

const pool = (await import('../config/database.js')).default;
const app = (await import('../index.js')).default;
const { default: request } = await import('supertest');
import jwt from 'jsonwebtoken';

describe('Category Routes', () => {
  const adminToken = jwt.sign({ id: 'admin-1', role: 'admin' }, 'fallback_secret');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/categories - should return all categories', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'cat-1', name: 'Test' }] });
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /api/categories/:id - should return a category', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'cat-1', name: 'Test' }] });
    const res = await request(app).get('/api/categories/cat-1');
    expect(res.status).toBe(200);
  });

  it('GET /api/categories/:id - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/categories/cat-1');
    expect(res.status).toBe(404);
  });

  it('POST /api/categories - should require admin', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'New' });
    expect(res.status).toBe(401);
  });

  it('POST /api/categories - should create category', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'cat-2', name: 'New' }] });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New' });
    expect(res.status).toBe(201);
  });

  it('PUT /api/categories/:id - should update category', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'cat-1', name: 'Updated' }] });
    const res = await request(app)
      .put('/api/categories/cat-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('PUT /api/categories/:id - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .put('/api/categories/cat-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/categories/:id - should delete category', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'cat-1' }] });
    const res = await request(app)
      .delete('/api/categories/cat-1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /api/categories/:id - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .delete('/api/categories/cat-1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
