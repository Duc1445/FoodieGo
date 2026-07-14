import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('full_name').trim().notEmpty().withMessage('Full name required'),
    body('role').optional().isIn(['customer', 'driver', 'merchant']).withMessage('Invalid role'),
  ],
  validate,
  authController.register,
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  authController.login,
);

// GET /api/auth/profile
router.get('/profile', authenticate, authController.getProfile);

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
  authController.updateProfile,
);

export default router;
