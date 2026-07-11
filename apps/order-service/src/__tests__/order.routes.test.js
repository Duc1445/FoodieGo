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

// Mock Redis to prevent real connection attempts from hanging the test process
jest.unstable_mockModule('../config/redis.js', () => {
  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn(),
    on: jest.fn(),
  };
  return { default: mockRedis };
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

  it('Merchant can get own orders', async () => {
    // Mock user_restaurants mapping
    db.query.mockResolvedValueOnce({ rows: [{ restaurant_id: 'rest-1' }] });
    // Mock getMerchantOrders
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'order-1', restaurantId: 'rest-1' }] });

    const res = await request(app)
      .get('/api/v1/orders/merchant')
      .set('Authorization', `Bearer ${merchantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('Merchant without restaurant mapping gets 403', async () => {
    // Mock user_restaurants mapping empty
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/v1/orders/merchant')
      .set('Authorization', `Bearer ${merchantToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Merchant has no associated restaurant');
  });

  it('Invalid status transition rejected', async () => {
    // Mock user_restaurants
    db.query.mockResolvedValueOnce({ rows: [{ restaurant_id: 'rest-1' }] });
    // Mock getOrderDetail in controller
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: customerId, restaurant_id: 'rest-1', status: 'COMPLETED' }],
    });
    // Mock getOrderDetail in service
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: customerId, restaurant_id: 'rest-1', status: 'COMPLETED' }],
    });

    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({ status: 'PREPARING' });

    expect(res.status).toBe(422);
  });

  it('Merchant role can update status if owns restaurant', async () => {
    // Mock user_restaurants mapping
    db.query.mockResolvedValueOnce({ rows: [{ restaurant_id: 'rest-1' }] });
    // Mock order detail in controller
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: customerId, restaurant_id: 'rest-1', status: 'CONFIRMED' }],
    });
    // Mock order detail in service
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: customerId, restaurant_id: 'rest-1', status: 'CONFIRMED' }],
    });
    // Mock update query
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

  it('Merchant role cannot update status of another restaurant order', async () => {
    // Mock user_restaurants mapping
    db.query.mockResolvedValueOnce({ rows: [{ restaurant_id: 'rest-1' }] });
    // Mock order detail
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: customerId, restaurant_id: 'rest-2', status: 'CONFIRMED' }],
    });

    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({ status: 'PREPARING' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Not authorized to update this order');
  });

  it('Customer role cannot update status', async () => {
    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'PREPARING' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  const adminToken = jwt.default.sign({ id: 'admin-id', role: 'admin' }, JWT_SECRET);

  it('Admin can get orders if restaurant_id provided', async () => {
    // Mock restaurant exists
    db.query.mockResolvedValueOnce({ rows: [{ id: 'rest-1' }] });
    // Mock getMerchantOrders
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'order-1', restaurantId: 'rest-1' }] });

    const res = await request(app)
      .get('/api/v1/orders/merchant?restaurant_id=rest-1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('Admin missing restaurant_id gets 400', async () => {
    const res = await request(app)
      .get('/api/v1/orders/merchant')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Admin must specify a restaurant_id');
  });

  it('Admin invalid restaurant_id gets 404', async () => {
    // Mock restaurant doesn't exist
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/v1/orders/merchant?restaurant_id=invalid')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Restaurant not found');
  });
});
