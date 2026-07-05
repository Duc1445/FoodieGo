// Unit tests for auth.middleware.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../config/jwt.js', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}));

const { verifyToken } = await import('../config/jwt.js');
const { authenticate, authorize } = await import('../middlewares/auth.middleware.js');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no token provided', () => {
      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with decoded user if token is valid', () => {
      req.headers['authorization'] = 'Bearer valid-token';
      verifyToken.mockReturnValue({ id: 'uuid-1', role: 'customer' });

      authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(req.user).toEqual({ id: 'uuid-1', role: 'customer' });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      req.headers['authorization'] = 'Bearer invalid-token';
      verifyToken.mockImplementation(() => {
        throw new Error('invalid');
      });

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should call next if user has required role', () => {
      req.user = { id: 'uuid-1', role: 'admin' };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user lacks required role', () => {
      req.user = { id: 'uuid-1', role: 'customer' };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user is undefined', () => {
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
