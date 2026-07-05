import { RestaurantService } from '../services/restaurant.service.js';
import { successResponse } from '@foodiego/core';

const service = new RestaurantService();

export class RestaurantController {
  async getAll(req, res, next) {
    try {
      const { items, pagination } = await service.getAllRestaurants(req.query);
      return successResponse(res, items, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const restaurant = await service.getRestaurantById(req.params.id);
      return successResponse(res, restaurant);
    } catch (err) {
      next(err);
    }
  }
}
