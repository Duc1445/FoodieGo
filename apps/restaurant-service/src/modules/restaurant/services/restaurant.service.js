import { RestaurantRepository } from '../repositories/restaurant.repository.js';
const repository = new RestaurantRepository();
export class RestaurantService {
  async getAllRestaurants() { return await repository.findAll(); }
  async getRestaurantById(id) { return await repository.findById(id); }
}
