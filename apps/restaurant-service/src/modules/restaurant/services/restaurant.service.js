import { RestaurantRepository } from '../repositories/restaurant.repository.js';
import { RestaurantNotFoundError } from '@foodiego/core';

import redis from '../../../config/redis.js';
import { config } from '@foodiego/core';

const repository = new RestaurantRepository();

export class RestaurantService {
  async getAllRestaurants(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const search = query.search || '';
    
    const cacheKey = `restaurants:page:${page}:limit:${limit}:search:${search}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await repository.findAll({ page, limit, search });
    
    let responseData = result;
    if (Array.isArray(result)) {
      responseData = {
        items: result,
        pagination: { page, limit, total: result.length }
      };
    }
    
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', config.redis.ttl);
    return responseData;
  }

  async getRestaurantById(id) {
    const cacheKey = `restaurant:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const restaurant = await repository.findById(id);
    if (!restaurant) {
      throw new RestaurantNotFoundError(id);
    }
    
    await redis.set(cacheKey, JSON.stringify(restaurant), 'EX', config.redis.ttl);
    return restaurant;
  }
}
