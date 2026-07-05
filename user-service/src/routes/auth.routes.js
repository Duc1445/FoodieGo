import { Router } from 'express';
import { body } from 'express-validator';
import * as authService from '../services/auth.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('full_name').trim().notEmpty().withMessage('Full name required'),
    body('role').optional().isIn(['customer', 'shipper']).withMessage('Invalid role'),
  ],
  validate,
  async (req, res) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, message: 'Registered successfully', data: result });
    } catch (err) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  },
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  async (req, res) => {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, message: 'Login successful', data: result });
    } catch (err) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  },
);

// GET /api/auth/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile
router.put(
  '/profile',
  authenticate,
  [
    body('full_name').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone(),
    body('address').optional().trim(),
  ],
  validate,
  async (req, res) => {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      res.json({ success: true, message: 'Profile updated', data: user });
    } catch (err) {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  },
);

export default router;
