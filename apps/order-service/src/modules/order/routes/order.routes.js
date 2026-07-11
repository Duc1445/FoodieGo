import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticate, authorize } from '@foodiego/shared-auth';

const router = Router();
const controller = new OrderController();

router.use(authenticate);

router.get('/', controller.getUserOrders.bind(controller));
router.get(
  '/merchant',
  authorize('merchant', 'admin'),
  controller.getMerchantOrders.bind(controller),
);
router.get('/:id', controller.getOrderDetail.bind(controller));
router.patch(
  '/:id/status',
  authorize('merchant', 'admin'),
  controller.updateOrderStatus.bind(controller),
);

export default router;
