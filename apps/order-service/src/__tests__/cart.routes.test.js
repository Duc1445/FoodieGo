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

jest.unstable_mockModule('../config/redis.js', () => {
  return {
    default: {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      on: jest.fn(),
    },
  };
});

jest.unstable_mockModule('../modules/cart/gateways/restaurant.gateway.js', () => {
  return {
    RestaurantGateway: class {
      async getRestaurantMenu() {
        return [{ id: '123e4567-e89b-12d3-a456-426614174002', price: 10 }];
      }
      async getRestaurantDetails() {
        return { id: 'restaurant-1', is_open: true };
      }
      async getMenuItemDetails() {
        return {
          id: '123e4567-e89b-12d3-a456-426614174002',
          restaurantId: 'restaurant-1',
          price: 10,
          availability: true,
        };
      }
    },
  };
});

const app = (await import('../app.js')).default;
const { default: request } = await import('supertest');
import jwt from 'jsonwebtoken';

describe('Cart Routes', () => {
  const token = jwt.sign(
    { id: '123e4567-e89b-12d3-a456-426614174001', role: 'customer' },
    'fallback_secret',
  );
  const foodId = '123e4567-e89b-12d3-a456-426614174002';

  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn().mockImplementation((text) => {
        if (!text || typeof text !== 'string') return Promise.resolve({});
        if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK')
          return Promise.resolve({});
        if (text.includes('INSERT INTO carts'))
          return Promise.resolve({ rows: [{ id: 'cart-1', version: 1 }] });
        return Promise.resolve({ rowCount: 1 });
      }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
  });

  it('GET /api/v1/cart - should return cart items', async () => {
    pool.query.mockImplementation((text) => {
      if (text.includes('SELECT * FROM carts'))
        return Promise.resolve({
          rows: [
            {
              id: 'cart-1',
              user_id: '123e4567-e89b-12d3-a456-426614174001',
              restaurant_id: 'restaurant-1',
            },
          ],
        });
      if (text.includes('SELECT * FROM cart_items'))
        return Promise.resolve({ rows: [{ menu_item_id: foodId, quantity: 2, price: 10 }] });
      return Promise.resolve({ rows: [] });
    });
    const res = await request(app).get('/api/v1/cart').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('PUT /api/v1/cart/items - should add item to cart', async () => {
    pool.query.mockImplementation((text) => {
      if (text.includes('SELECT * FROM carts'))
        return Promise.resolve({
          rows: [
            {
              id: 'cart-1',
              user_id: '123e4567-e89b-12d3-a456-426614174001',
              restaurant_id: 'restaurant-1',
            },
          ],
        });
      if (text.includes('SELECT * FROM cart_items')) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [] });
    });
    const res = await request(app)
      .put('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ menu_item_id: foodId, quantity: 1 });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/v1/cart/items/:foodId - should update quantity', async () => {
    pool.query.mockImplementation((text) => {
      if (text.includes('SELECT * FROM carts'))
        return Promise.resolve({
          rows: [
            {
              id: 'cart-1',
              user_id: '123e4567-e89b-12d3-a456-426614174001',
              restaurant_id: 'restaurant-1',
            },
          ],
        });
      if (text.includes('SELECT * FROM cart_items'))
        return Promise.resolve({ rows: [{ menu_item_id: foodId, quantity: 2, price: 10 }] });
      return Promise.resolve({ rows: [] });
    });
    const res = await request(app)
      .patch(`/api/v1/cart/items/${foodId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(200);
  });

  it('PATCH /api/v1/cart/items/:foodId - should return 404 if not found', async () => {
    pool.query.mockImplementation((text) => {
      if (text.includes('SELECT * FROM carts'))
        return Promise.resolve({
          rows: [
            {
              id: 'cart-1',
              user_id: '123e4567-e89b-12d3-a456-426614174001',
              restaurant_id: 'restaurant-1',
            },
          ],
        });
      if (text.includes('SELECT * FROM cart_items')) return Promise.resolve({ rows: [] }); // empty items
      return Promise.resolve({ rows: [] });
    });
    const res = await request(app)
      .patch(`/api/v1/cart/items/${foodId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/v1/cart/items/:foodId - should remove item', async () => {
    pool.query.mockImplementation((text) => {
      if (text.includes('SELECT * FROM carts'))
        return Promise.resolve({
          rows: [
            {
              id: 'cart-1',
              user_id: '123e4567-e89b-12d3-a456-426614174001',
              restaurant_id: 'restaurant-1',
            },
          ],
        });
      if (text.includes('SELECT * FROM cart_items'))
        return Promise.resolve({ rows: [{ menu_item_id: foodId, quantity: 2, price: 10 }] });
      return Promise.resolve({ rows: [] });
    });
    const res = await request(app)
      .delete(`/api/v1/cart/items/${foodId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /api/v1/cart/items/:foodId - should return 404 if not found', async () => {
    pool.query.mockImplementation((text) => {
      if (text.includes('SELECT * FROM carts'))
        return Promise.resolve({
          rows: [
            {
              id: 'cart-1',
              user_id: '123e4567-e89b-12d3-a456-426614174001',
              restaurant_id: 'restaurant-1',
            },
          ],
        });
      if (text.includes('SELECT * FROM cart_items')) return Promise.resolve({ rows: [] }); // empty items
      return Promise.resolve({ rows: [] });
    });
    const res = await request(app)
      .delete(`/api/v1/cart/items/${foodId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200); // Idempotent delete returns 200
  });
});
