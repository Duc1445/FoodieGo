// Integration tests for auth routes using Supertest
import { jest } from '@jest/globals';

// Mock the database pool before importing app
jest.unstable_mockModule('../config/database.js', () => {
  const mockQuery = jest.fn();
  return {
    default: {
      query: mockQuery,
      on: jest.fn(),
    },
  };
});

const pool = (await import('../config/database.js')).default;
const app = (await import('../index.js')).default;

// Dynamic import supertest
const { default: request } = await import('supertest');
const { generateToken } = await import('../config/jwt.js');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'notanemail', password: '123456', full_name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: '123', full_name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if full_name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: '123456' });

      expect(res.status).toBe(400);
    });

    it('should return 201 on successful registration', async () => {
      // Mock: no existing user
      pool.query.mockResolvedValueOnce({ rows: [] });
      // Mock: create user
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 'uuid-1',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'customer',
          created_at: new Date(),
        }],
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 409 if email already exists', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          full_name: 'Existing User',
        });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: '123456' });

      expect(res.status).toBe(400);
    });

    it('should return 401 if user not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
    });

    it('should return profile with valid token', async () => {
      const token = generateToken({ id: 'uuid-1', role: 'customer' });
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 'uuid-1',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'customer',
        }],
      });

      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    it('should update profile', async () => {
      const token = generateToken({ id: 'uuid-1', role: 'customer' });
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 'uuid-1',
          full_name: 'Updated',
          phone: '0123456789',
          email: 'test@example.com',
          role: 'customer',
        }],
      });

      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ full_name: 'Updated', phone: '0123456789' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
