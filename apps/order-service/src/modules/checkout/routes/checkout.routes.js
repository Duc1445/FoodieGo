import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller.js';
import { authenticate } from '../../../middlewares/auth.middleware.js';

const router = Router();
const controller = new CheckoutController();

router.use(authenticate);

router.post('/checkout', controller.processCheckout.bind(controller));

export default router;
