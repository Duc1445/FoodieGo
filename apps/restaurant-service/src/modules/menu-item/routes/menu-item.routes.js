import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { MenuItemController } from '../controllers/menu-item.controller.js';

const router = Router();
const menuController = new MenuItemController();

const validateCreate = [
  body('name').notEmpty().withMessage('Name is required').isString(),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category_id').isUUID().withMessage('Category ID must be a valid UUID'),
  body('restaurant_id')
    .optional()
    .isUUID()
    .withMessage('Restaurant ID must be a valid UUID if provided'),
  body('is_available').optional().isBoolean(),
  body('display_order').optional().isInt(),
];

const validateUpdate = [
  body('name').optional().isString(),
  body('price').optional().isNumeric(),
  body('category_id').optional().isUUID(),
  body('is_available').optional().isBoolean(),
  body('display_order').optional().isInt(),
];

router.get('/items', menuController.getAll.bind(menuController));
router.get(
  '/merchant/items',
  authenticate,
  authorize('merchant'),
  menuController.getMerchantItems.bind(menuController),
);
router.get('/items/:id', menuController.getById.bind(menuController));

router.post(
  '/items',
  authenticate,
  authorize('admin', 'merchant'),
  validateCreate,
  validate,
  menuController.create.bind(menuController),
);

router.put(
  '/items/:id',
  authenticate,
  authorize('admin', 'merchant'),
  validateUpdate,
  validate,
  menuController.update.bind(menuController),
);

router.delete(
  '/items/:id',
  authenticate,
  authorize('admin', 'merchant'),
  menuController.softDelete.bind(menuController),
);

export default router;
