import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { authenticate } from '@foodiego/shared-auth';

const router = Router();
const controller = new CartController();

router.use(authenticate);

router.get('/', controller.getCart.bind(controller));
router.put('/items', controller.addItem.bind(controller));
router.patch('/items/:id', controller.updateItemQuantity.bind(controller));
router.delete('/items/:id', controller.removeItem.bind(controller));
router.delete('/', controller.clearCart.bind(controller));

export default router;
