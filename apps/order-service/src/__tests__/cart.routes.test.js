import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => {
  return {
    default: {
      query: jest.fn(),
      on: jest.fn(),
      connect: jest.fn(),
    },
  };
});

const pool = (await import('../config/database.js')).default;
const app = (await import('../app.js')).default;
const { default: request } = await import('supertest');
import jwt from 'jsonwebtoken';

describe('Cart Routes', () => {
  const token = jwt.sign(
    { id: '123e4567-e89b-12d3-a456-426614174001', role: 'customer' },
    'fallback_secret',
  );
  const foodId = '123e4567-e89b-12d3-a456-426614174002';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/cart - should return cart items', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ food_id: foodId, quantity: 2, price: 10 }] });
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/cart - should add item to cart', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ food_id: foodId, quantity: 1 }] });
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ food_id: foodId, quantity: 1 });
    expect(res.status).toBe(201);
  });

  it('PUT /api/cart/:foodId - should update quantity', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ food_id: foodId, quantity: 5 }] });
    const res = await request(app)
      .put(`/api/cart/${foodId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(200);
  });

  it('PUT /api/cart/:foodId - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .put(`/api/cart/${foodId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/cart/:foodId - should remove item', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [] });
    const res = await request(app)
      .delete(`/api/cart/${foodId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /api/cart/:foodId - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const res = await request(app)
      .delete(`/api/cart/${foodId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
