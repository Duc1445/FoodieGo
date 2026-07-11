import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '@foodiego/core';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return next(new AuthenticationError('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AuthenticationError('No token provided'));
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return next(new AuthenticationError('Invalid or expired token'));
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AuthorizationError('Forbidden: insufficient role'));
    }
    next();
  };
