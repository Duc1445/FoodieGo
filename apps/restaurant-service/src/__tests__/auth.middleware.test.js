import { jest } from '@jest/globals';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
  },
}));

const jwt = (await import('jsonwebtoken')).default;
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
        expect.objectContaining({ success: false })
      );
    });

    it('should return 401 if token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should call next if token is valid', () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ id: 'uuid-1', role: 'admin' });

      authenticate(req, res, next);
      expect(req.user).toEqual({ id: 'uuid-1', role: 'admin' });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should return 403 if user lacks required role', () => {
      req.user = { id: 'uuid-1', role: 'customer' };
      const middleware = authorize('admin');
      
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should call next if user has required role', () => {
      req.user = { id: 'uuid-1', role: 'admin' };
      const middleware = authorize('admin');
      
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
