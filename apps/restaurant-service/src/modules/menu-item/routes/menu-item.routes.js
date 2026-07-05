import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { MenuItemController } from '../controllers/menuItem.controller.js';

const router = Router();
const menuController = new MenuItemController();

router.get('/', menuController.getMenus);
router.get('/:id', menuController.getMenuById);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  menuController.createMenu
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  menuController.updateMenu
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  menuController.deleteMenu
);

export default router;
