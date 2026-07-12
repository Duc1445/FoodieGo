import express from 'express';
import { AddressController } from '../controllers/address.controller.js';
import { authenticate, authorize } from '@foodiego/shared-auth';

const router = express.Router({ mergeParams: true });
const controller = new AddressController();

// All address routes require authentication and ownership of the :id param
// The URL will be /api/v1/users/:id/addresses
router.use(authenticate);

const requireUserMatch = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, message: 'Forbidden: insufficient role or wrong user' });
};

router.get('/:id/addresses', requireUserMatch, controller.getAddresses.bind(controller));
router.post('/:id/addresses', requireUserMatch, controller.addAddress.bind(controller));
router.put(
  '/:id/addresses/:addressId',
  requireUserMatch,
  controller.updateAddress.bind(controller),
);
router.delete(
  '/:id/addresses/:addressId',
  requireUserMatch,
  controller.deleteAddress.bind(controller),
);

export default router;
