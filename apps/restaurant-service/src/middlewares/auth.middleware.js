import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError, config } from '@foodiego/core';

export const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return next(new AuthenticationError('No token provided'));
  }
  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    return next(new AuthenticationError('Invalid or expired token'));
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    console.log('authorize middleware check:', { roles, userRole: req.user?.role, user: req.user });
    if (!roles.includes(req.user?.role)) {
      return next(new AuthorizationError('Forbidden: insufficient role'));
    }
    next();
  };
