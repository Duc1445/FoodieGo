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

describe('Delivery Routes', () => {
  const token = jwt.sign(
    { id: '123e4567-e89b-12d3-a456-426614174001', role: 'customer' },
    'fallback_secret',
  );
  const driverToken = jwt.sign(
    { id: '123e4567-e89b-12d3-a456-426614174003', role: 'driver' },
    'fallback_secret',
  );
  const orderId = '123e4567-e89b-12d3-a456-426614174004';
  const deliveryId = '123e4567-e89b-12d3-a456-426614174005';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/delivery/order/:orderId - should return delivery info', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: deliveryId, status: 'waiting' }] });
    const res = await request(app)
      .get(`/api/v1/delivery/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /api/v1/delivery/:id/accept - should accept delivery', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: deliveryId, status: 'accepted' }] });
    const res = await request(app)
      .patch(`/api/v1/delivery/${deliveryId}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /api/v1/delivery/:id/accept - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .patch(`/api/v1/delivery/${deliveryId}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /api/v1/delivery/:id/status - should update status', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: deliveryId, status: 'delivering' }] });
    const res = await request(app)
      .patch(`/api/v1/delivery/${deliveryId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ status: 'delivering' });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/v1/delivery/:id/status - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .patch(`/api/v1/delivery/${deliveryId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ status: 'delivering' });
    expect(res.status).toBe(404);
  });

  it('GET /health - should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
