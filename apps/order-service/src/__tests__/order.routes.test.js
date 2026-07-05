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

describe('Order Routes', () => {
  const token = jwt.sign({ id: '123e4567-e89b-12d3-a456-426614174001', role: 'customer' }, 'fallback_secret');
  const adminToken = jwt.sign({ id: '123e4567-e89b-12d3-a456-426614174009', role: 'admin' }, 'fallback_secret');
  const orderId = '123e4567-e89b-12d3-a456-426614174004';
  const foodId = '123e4567-e89b-12d3-a456-426614174002';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/orders - should return user orders', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: orderId, total_price: 100 }] });
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/orders/:id - should return order details', async () => {
    // 1st query: order details
    pool.query.mockResolvedValueOnce({ rows: [{ id: orderId, total_price: 100, user_id: '123e4567-e89b-12d3-a456-426614174001' }] });
    // 2nd query: order items
    pool.query.mockResolvedValueOnce({ rows: [{ food_id: foodId, quantity: 2 }] });
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/orders/:id - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /api/orders/:id/status - should update status (admin)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: orderId, status: 'confirmed' }] });
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/orders/:id/status - should return 404 if not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(404);
  });

  it('POST /api/orders - should create order (checkout)', async () => {
    const mockClient = { query: jest.fn(), release: jest.fn() };
    pool.connect.mockResolvedValueOnce(mockClient);
    
    // cart items query (getCart) uses pool.query
    pool.query.mockResolvedValueOnce({ rows: [{ food_id: foodId, quantity: 2, price: 50 }] });
    
    // OrderModel.create transaction uses mockClient.query
    mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: orderId }] }); // INSERT order
    mockClient.query.mockResolvedValueOnce({ rows: [] }); // INSERT items
    mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

    // DeliveryModel.create uses pool.query
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'del-1' }] });
    
    // CartModel.clearCart uses pool.query
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: '123 Main St', note: 'Leave at door' });

    expect(res.status).toBe(201);
  });
});
