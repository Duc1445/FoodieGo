// Unit tests for jwt.js config
import { jest } from '@jest/globals';

const { generateToken, verifyToken } = await import('../config/jwt.js');

describe('JWT Config', () => {
  it('should generate a valid JWT token', () => {
    const payload = { id: 'uuid-1', role: 'customer' };
    const token = generateToken(payload);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify a valid token and return payload', () => {
    const payload = { id: 'uuid-1', role: 'customer' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded).toHaveProperty('id', 'uuid-1');
    expect(decoded).toHaveProperty('role', 'customer');
  });

  it('should throw on invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });
});
