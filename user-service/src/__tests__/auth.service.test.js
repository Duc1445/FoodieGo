// Unit tests for auth.service.js
import { jest } from '@jest/globals';

// Mock the database module
const mockQuery = jest.fn();
jest.unstable_mockModule('../modules/user/repositories/user.repository.js', () => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
}));

jest.unstable_mockModule('../config/jwt.js', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token'),
  verifyToken: jest.fn(),
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn(() => Promise.resolve('hashed_password')),
    compare: jest.fn(),
  },
}));

const { findUserByEmail, findUserById, createUser, updateUser } = await import('../modules/user/repositories/user.repository.js');
const { generateToken } = await import('../config/jwt.js');
const bcrypt = (await import('bcryptjs')).default;
const { register, login, getProfile, updateProfile } = await import('../modules/auth/services/auth.service.js');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Register ─────────────────────────────────────────────────────────
  describe('register', () => {
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      findUserByEmail.mockResolvedValue(null);
      createUser.mockResolvedValue({
        id: 'uuid-1',
        email: newUser.email,
        full_name: newUser.full_name,
        role: 'customer',
      });

      const result = await register(newUser);

      expect(findUserByEmail).toHaveBeenCalledWith(newUser.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
      expect(createUser).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock-jwt-token');
    });

    it('should throw 409 if email already exists', async () => {
      findUserByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(register(newUser)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already exists',
      });
    });
  });

  // ─── Login ────────────────────────────────────────────────────────────
  describe('login', () => {
    const credentials = { email: 'test@example.com', password: 'password123' };

    it('should login successfully with valid credentials', async () => {
      findUserByEmail.mockResolvedValue({
        id: 'uuid-1',
        email: credentials.email,
        password: 'hashed_password',
        role: 'customer',
        is_active: true,
      });
      bcrypt.compare.mockResolvedValue(true);

      const result = await login(credentials);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw 401 if user not found', async () => {
      findUserByEmail.mockResolvedValue(null);

      await expect(login(credentials)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw 401 if password is wrong', async () => {
      findUserByEmail.mockResolvedValue({
        id: 'uuid-1',
        email: credentials.email,
        password: 'hashed_password',
        is_active: true,
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(login(credentials)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw 403 if account is deactivated', async () => {
      findUserByEmail.mockResolvedValue({
        id: 'uuid-1',
        email: credentials.email,
        password: 'hashed_password',
        is_active: false,
      });
      bcrypt.compare.mockResolvedValue(true);

      await expect(login(credentials)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  // ─── Get Profile ──────────────────────────────────────────────────────
  describe('getProfile', () => {
    it('should return user profile', async () => {
      findUserById.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        full_name: 'Test User',
      });

      const result = await getProfile('uuid-1');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should throw 404 if user not found', async () => {
      findUserById.mockResolvedValue(null);

      await expect(getProfile('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ─── Update Profile ───────────────────────────────────────────────────
  describe('updateProfile', () => {
    it('should update user profile', async () => {
      updateUser.mockResolvedValue({
        id: 'uuid-1',
        full_name: 'Updated Name',
        phone: '0123456789',
      });

      const result = await updateProfile('uuid-1', {
        full_name: 'Updated Name',
        phone: '0123456789',
      });

      expect(updateUser).toHaveBeenCalledWith('uuid-1', {
        full_name: 'Updated Name',
        phone: '0123456789',
      });
      expect(result.full_name).toBe('Updated Name');
    });

    it('should throw 404 if user not found', async () => {
      updateUser.mockResolvedValue(null);

      await expect(
        updateProfile('nonexistent', { full_name: 'Test' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
