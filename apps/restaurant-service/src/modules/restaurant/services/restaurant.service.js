import { RestaurantRepository } from '../repositories/restaurant.repository.js';
const repository = new RestaurantRepository();

export class RestaurantService {
  async getAllRestaurants(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const search = query.search || '';
    return await repository.findAll({ page, limit, search });
  }

  async getRestaurantById(id) {
    return await repository.findById(id);
  }
}
