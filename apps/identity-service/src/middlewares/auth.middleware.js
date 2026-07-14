import { verifyToken } from '../config/jwt.js';
import pool from '../config/database.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    if (process.env.NODE_ENV !== 'test') {
      const { rows } = await pool.query('SELECT id, is_active FROM users WHERE id = $1', [
        decoded.id,
      ]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }
      if (rows[0].is_active === false) {
        return res.status(403).json({ success: false, message: 'User account is deactivated' });
      }
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
};
