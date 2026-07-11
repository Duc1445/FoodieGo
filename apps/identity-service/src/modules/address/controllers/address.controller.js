import { AddressRepository } from '../repositories/address.repository.js';
import { successResponse, NotFoundError, ValidationError } from '@foodiego/core';

const repository = new AddressRepository();
const MAX_ADDRESSES = 10;

export class AddressController {
  async getAddresses(req, res, next) {
    try {
      // req.user is set by authenticate middleware
      // route handles /api/v1/users/:id/addresses
      const targetUserId = req.params.id;

      const addresses = await repository.findByUserId(targetUserId);
      return successResponse(res, addresses);
    } catch (err) {
      next(err);
    }
  }

  async addAddress(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const { address, phone, isDefault } = req.body;

      if (!address || !phone) {
        throw new ValidationError('Address and phone are required', 'MISSING_FIELDS');
      }

      // Check limit
      const currentCount = await repository.countActiveByUserId(targetUserId);
      if (currentCount >= MAX_ADDRESSES) {
        throw new ValidationError(
          `Maximum of ${MAX_ADDRESSES} addresses allowed`,
          'ADDRESS_LIMIT_REACHED',
        );
      }

      const newAddress = await repository.create(targetUserId, { address, phone, isDefault });
      return successResponse(res, newAddress, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const { addressId } = req.params;
      const { address, phone, isDefault } = req.body;

      const updated = await repository.update(addressId, targetUserId, {
        address,
        phone,
        isDefault,
      });

      if (!updated) {
        throw new NotFoundError('Address not found or unauthorized', 'ADDRESS_NOT_FOUND', {
          id: addressId,
        });
      }

      return successResponse(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const { addressId } = req.params;

      const deleted = await repository.softDelete(addressId, targetUserId);

      if (!deleted) {
        throw new NotFoundError('Address not found or unauthorized', 'ADDRESS_NOT_FOUND', {
          id: addressId,
        });
      }

      return successResponse(res, { deleted: true });
    } catch (err) {
      next(err);
    }
  }
}
