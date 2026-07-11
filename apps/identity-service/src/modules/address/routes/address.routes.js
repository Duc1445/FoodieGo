import express from 'express';
import { AddressController } from '../controllers/address.controller.js';
import { authenticate, authorize } from '@foodiego/shared-auth';

const router = express.Router({ mergeParams: true });
const controller = new AddressController();

// All address routes require authentication and ownership of the :id param
// The URL will be /api/v1/users/:id/addresses
router.use(authenticate);
router.use(authorize({ allowSameUser: true }));

router.get('/', controller.getAddresses);
router.post('/', controller.addAddress);
router.put('/:addressId', controller.updateAddress);
router.delete('/:addressId', controller.deleteAddress);

export default router;
