import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import * as cartController from '../controllers/cart.controller.js';

const router = Router();

router.get('/', authenticate, cartController.getCart);

router.post(
  '/',
  authenticate,
  body('menu_id').isUUID().withMessage('menu_id must be a valid UUID'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
  validate,
  cartController.addItem
);

router.put(
  '/:menuId',
  authenticate,
  param('menuId').isUUID().withMessage('menuId must be a valid UUID'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
  validate,
  cartController.updateItem
);

router.delete(
  '/:menuId',
  authenticate,
  param('menuId').isUUID().withMessage('menuId must be a valid UUID'),
  validate,
  cartController.removeItem
);

export default router;
