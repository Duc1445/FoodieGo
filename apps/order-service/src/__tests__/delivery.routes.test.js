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
const app = (await import('../index.js')).default;
const { default: request } = await import('supertest');
import jwt from 'jsonwebtoken';

describe('Delivery Routes', () => {
  const token = jwt.sign({ id: '123e4567-e89b-12d3-a456-426614174001', role: 'customer' }, 'fallback_secret');
  const shipperToken = jwt.sign({ id: '123e4567-e89b-12d3-a456-426614174003', role: 'shipper' }, 'fallback_secret');
  const orderId = '123e4567-e89b-12d3-a456-426614174004';
  const deliveryId = '123e4567-e89b-12d3-a456-426614174005';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/delivery/order/:orderId - should return delivery info', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: deliveryId, status: 'waiting' }] });
    const res = await request(app)
      .get(`/api/delivery/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /api/delivery/:id/accept - should accept delivery', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: deliveryId, status: 'accepted' }] });
    const res = await request(app)
      .patch(`/api/delivery/${deliveryId}/accept`)
      .set('Authorization', `Bearer ${shipperToken}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /api/delivery/:id/accept - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .patch(`/api/delivery/${deliveryId}/accept`)
      .set('Authorization', `Bearer ${shipperToken}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /api/delivery/:id/status - should update status', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: deliveryId, status: 'delivering' }] });
    const res = await request(app)
      .patch(`/api/delivery/${deliveryId}/status`)
      .set('Authorization', `Bearer ${shipperToken}`)
      .send({ status: 'delivering' });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/delivery/:id/status - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .patch(`/api/delivery/${deliveryId}/status`)
      .set('Authorization', `Bearer ${shipperToken}`)
      .send({ status: 'delivering' });
    expect(res.status).toBe(404);
  });
  
  it('GET /health - should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
