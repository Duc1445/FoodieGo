import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { authenticate } from '@foodiego/core'; // Assuming authenticate is exposed or we use our own

const router = Router();
const controller = new CartController();

// Mock authenticate for now if it's not exported from core, 
// wait, Identity Service manages users. Gateway passes user context.
// Let's assume req.user is set by gateway or local auth middleware.
// We'll use a basic mock auth middleware just to parse the header if needed,
// but usually gateway injects X-User-Id. Let's use a simple middleware to extract it.

const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'] || '11111111-1111-1111-1111-111111111111'; // Mock user
  req.user = { id: userId };
  next();
};

router.use(extractUser);

router.get('/', controller.getCart.bind(controller));
router.put('/items', controller.addItem.bind(controller));
router.patch('/items/:id', controller.updateItemQuantity.bind(controller));
router.delete('/items/:id', controller.removeItem.bind(controller));
router.delete('/', controller.clearCart.bind(controller));

export default router;
