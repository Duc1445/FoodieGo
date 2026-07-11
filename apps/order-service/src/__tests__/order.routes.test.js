import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/database.js', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    default: {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(mockClient),
    },
  };
});

const db = (await import('../config/database.js')).default;
const mockClient = await db.connect();
const app = (await import('../app.js')).default;
const { default: request } = await import('supertest');
const jwt = await import('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const customerId = '11111111-1111-1111-1111-111111111111';
const otherCustomerId = '22222222-2222-2222-2222-222222222222';
const customerToken = jwt.default.sign({ id: customerId, role: 'customer' }, JWT_SECRET);
const merchantToken = jwt.default.sign({ id: 'merchant-id', role: 'merchant' }, JWT_SECRET);

describe('Order Routes & Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /orders without token -> 401', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(401);
  });

  it('GET /orders with invalid token -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', 'Bearer invalid_token');
    expect(res.status).toBe(401);
  });

  it('User can get own order history', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'order-1', user_id: customerId }] });

    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(mockClient.query).toHaveBeenCalledWith(expect.any(String), [customerId]);
  });

  it("User cannot access another user's order", async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: otherCustomerId, status: 'CREATED' }],
    });

    const res = await request(app)
      .get('/api/v1/orders/order-1')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access denied');
  });

  it('Invalid status transition rejected', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: customerId, status: 'COMPLETED' }],
    });

    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({ status: 'PREPARING' });

    expect(res.status).toBe(422);
  });

  it('Merchant role can update status', async () => {
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: customerId, status: 'CONFIRMED' }],
    });
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', status: 'PREPARING' }],
    });

    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({ status: 'PREPARING' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PREPARING');
  });

  it('Customer role cannot update status', async () => {
    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'PREPARING' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });
});
