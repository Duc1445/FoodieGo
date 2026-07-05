import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => ({
  default: {
    query: jest.fn(),
    on: jest.fn(),
  },
}));

jest.unstable_mockModule('../config/redis.js', () => ({
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    on: jest.fn(),
  },
}));

const pool = (await import('../config/database.js')).default;
const app = (await import('../index.js')).default;
const { default: request } = await import('supertest');
import jwt from 'jsonwebtoken';

describe('Menu Routes', () => {
  const adminToken = jwt.sign({ id: 'admin-1', role: 'admin' }, 'fallback_secret');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/menus - should return menus', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ count: '1' }] }); // count query
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'menu-1', name: 'Menu' }] }); // data query
    const res = await request(app).get('/api/menus');
    expect(res.status).toBe(200);
  });

  const menuId = '123e4567-e89b-12d3-a456-426614174002';

  it('GET /api/menus/:id - should return menu', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: menuId }] });
    const res = await request(app).get(`/api/menus/${menuId}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/menus/:id - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get(`/api/menus/${menuId}`);
    expect(res.status).toBe(404);
  });

  it('POST /api/menus - should create menu', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: menuId, name: 'Burger', price: 10.99 }] });
    const res = await request(app)
      .post('/api/menus')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Burger', price: 10.99 });
    expect(res.status).toBe(201);
  });

  it('PUT /api/menus/:id - should update menu', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: menuId, name: 'Updated' }] });
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated', price: 15.99 });
    expect(res.status).toBe(200);
  });

  it('PUT /api/menus/:id - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .put(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated', price: 15.99 });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/menus/:id - should delete menu', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: menuId }] });
    const res = await request(app)
      .delete(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /api/menus/:id - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .delete(`/api/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
  
  it('GET /health - should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
