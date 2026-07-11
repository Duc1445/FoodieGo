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
    on: jest.fn(),
  },
}));

const pool = (await import('../config/database.js')).default;
const redis = (await import('../config/redis.js')).default;
const app = (await import('../index.js')).default;
const { default: request } = await import('supertest');
import jwt from 'jsonwebtoken';

describe('MenuItem Routes', () => {
  const adminToken = jwt.sign(
    { id: 'admin-1', role: 'admin' },
    'fallback_secret_do_not_use_in_prod',
  );

  const merchantToken = jwt.sign(
    { id: 'merchant-1', role: 'merchant' },
    'fallback_secret_do_not_use_in_prod',
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const menuItemId = '123e4567-e89b-12d3-a456-426614174001';
  const restaurantId = '123e4567-e89b-12d3-a456-426614174002';
  const categoryId = '123e4567-e89b-12d3-a456-426614174003';

  it('GET /api/v1/menus/items - should return all menu items', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: menuItemId, name: 'Test Item' }] });
    const res = await request(app).get('/api/v1/menus/items');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /api/v1/menus/items/:id - should return menu item', async () => {
    redis.get.mockResolvedValueOnce(null);
    pool.query.mockResolvedValueOnce({
      rows: [{ id: menuItemId, name: 'Test Item', restaurant_id: restaurantId }],
    });
    const res = await request(app).get(`/api/v1/menus/items/${menuItemId}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/v1/menus/items - admin without restaurant_id should fail', async () => {
    const res = await request(app)
      .post('/api/v1/menus/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test', price: 10, category_id: categoryId });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/menus/items - admin with invalid restaurant_id should fail', async () => {
    // Mock restaurant check failing
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/v1/menus/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test', price: 10, category_id: categoryId, restaurant_id: restaurantId });
    expect(res.status).toBe(404);
  });

  it('POST /api/v1/menus/items - admin valid should create item', async () => {
    // _getAuthorizedRestaurantId (restaurant exists)
    pool.query.mockResolvedValueOnce({ rows: [{ id: restaurantId }] });
    // _validateCategory (category belongs to restaurant)
    pool.query.mockResolvedValueOnce({ rows: [{ id: categoryId }] });
    // create menu item
    pool.query.mockResolvedValueOnce({
      rows: [{ id: menuItemId, name: 'Test', restaurant_id: restaurantId }],
    });

    const res = await request(app)
      .post('/api/v1/menus/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test', price: 10, category_id: categoryId, restaurant_id: restaurantId });
    expect(res.status).toBe(201);
  });

  it('POST /api/v1/menus/items - merchant no mapping should fail', async () => {
    // _getAuthorizedRestaurantId (merchant has no mapping)
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/v1/menus/items')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({ name: 'Test', price: 10, category_id: categoryId });
    expect(res.status).toBe(403);
  });

  it('POST /api/v1/menus/items - merchant valid should create item', async () => {
    // _getAuthorizedRestaurantId (merchant mapping)
    pool.query.mockResolvedValueOnce({ rows: [{ restaurant_id: restaurantId }] });
    // _validateCategory
    pool.query.mockResolvedValueOnce({ rows: [{ id: categoryId }] });
    // create menu item
    pool.query.mockResolvedValueOnce({
      rows: [{ id: menuItemId, name: 'Test', restaurant_id: restaurantId }],
    });

    const res = await request(app)
      .post('/api/v1/menus/items')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({ name: 'Test', price: 10, category_id: categoryId });
    expect(res.status).toBe(201);
  });

  it('PUT /api/v1/menus/items/:id - merchant valid should update item', async () => {
    // getMenuItemById
    redis.get.mockResolvedValueOnce(null);
    pool.query.mockResolvedValueOnce({ rows: [{ id: menuItemId, restaurant_id: restaurantId }] });
    // _getAuthorizedRestaurantId
    pool.query.mockResolvedValueOnce({ rows: [{ restaurant_id: restaurantId }] });
    // update
    pool.query.mockResolvedValueOnce({ rows: [{ id: menuItemId, name: 'Updated' }] });

    const res = await request(app)
      .put(`/api/v1/menus/items/${menuItemId}`)
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/v1/menus/items/:id - merchant valid should soft delete item', async () => {
    // getMenuItemById
    redis.get.mockResolvedValueOnce(null);
    pool.query.mockResolvedValueOnce({ rows: [{ id: menuItemId, restaurant_id: restaurantId }] });
    // _getAuthorizedRestaurantId
    pool.query.mockResolvedValueOnce({ rows: [{ restaurant_id: restaurantId }] });
    // delete
    pool.query.mockResolvedValueOnce({ rows: [{ id: menuItemId }] });

    const res = await request(app)
      .delete(`/api/v1/menus/items/${menuItemId}`)
      .set('Authorization', `Bearer ${merchantToken}`);
    expect(res.status).toBe(200);
  });
});
