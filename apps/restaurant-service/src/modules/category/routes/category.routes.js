import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validateRequest as validate } from '@foodiego/core';
import { CategoryController } from '../controllers/category.controller.js';

const router = Router();
const categoryController = new CategoryController();

router.get('/', categoryController.getAllCategories.bind(categoryController));

router.get('/:id', categoryController.getCategoryById.bind(categoryController));

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
    body('image_url').optional().isURL().withMessage('Valid URL required')
  ],
  validate,
  categoryController.createCategory.bind(categoryController)
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    param('id').isUUID().withMessage('Invalid category ID'),
    body('name').optional().notEmpty(),
    body('description').optional().isString(),
    body('image_url').optional().isURL(),
    body('is_active').optional().isBoolean()
  ],
  validate,
  categoryController.updateCategory.bind(categoryController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isUUID().withMessage('Invalid category ID')],
  validate,
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
