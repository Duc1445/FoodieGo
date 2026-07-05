import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller.js';

const router = Router();
const controller = new CheckoutController();

// Mock authenticate middleware
const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'] || '11111111-1111-1111-1111-111111111111';
  req.user = { id: userId };
  next();
};

router.use(extractUser);

router.post('/checkout', controller.processCheckout.bind(controller));

export default router;
