import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { MenuItemController } from '../controllers/menu-item.controller.js';

const router = Router();
const menuController = new MenuItemController();

router.get('/', menuController.getAll.bind(menuController));
router.get('/:id', menuController.getById.bind(menuController));

export default router;
