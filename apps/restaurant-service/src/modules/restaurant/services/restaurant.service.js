import { RestaurantRepository } from '../repositories/restaurant.repository.js';
import { RestaurantNotFoundError } from '@foodiego/core';

import redis from '../../../config/redis.js';
import { config, createLogger } from '@foodiego/core';

const repository = new RestaurantRepository();
const logger = createLogger('restaurant-service');

async function readCache(cacheKey) {
  try {
    return await redis.get(cacheKey);
  } catch (error) {
    logger.warn({ err: error, cacheKey }, 'Restaurant cache read failed');
    return null;
  }
}

async function writeCache(cacheKey, payload) {
  try {
    await redis.set(cacheKey, payload, 'EX', config.redis.ttl);
  } catch (error) {
    logger.warn({ err: error, cacheKey }, 'Restaurant cache write failed');
  }
}

export class RestaurantService {
  async getAllRestaurants(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const search = query.search || '';
    const parsedLat = query.lat !== undefined ? parseFloat(query.lat) : undefined;
    const parsedLng = query.lng !== undefined ? parseFloat(query.lng) : undefined;
    const parsedRadius = query.radius !== undefined ? parseFloat(query.radius) : undefined;
    const lat = Number.isFinite(parsedLat) ? parsedLat : undefined;
    const lng = Number.isFinite(parsedLng) ? parsedLng : undefined;
    const radius = Number.isFinite(parsedRadius) ? parsedRadius : undefined;

    const cacheKey = `restaurants:page:${page}:limit:${limit}:search:${search}:lat:${lat}:lng:${lng}:radius:${radius}`;
    const cached = await readCache(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return {
          items: parsed,
          pagination: { page, limit, total: parsed.length },
        };
      }
      return parsed;
    }

    const result = await repository.findAll({ page, limit, search, lat, lng, radius });
    const responseData = Array.isArray(result)
      ? {
          items: result,
          pagination: { page, limit, total: result.length },
        }
      : {
          items: result.items,
          pagination: { page, limit, total: result.total },
        };

    await writeCache(cacheKey, JSON.stringify(responseData));
    return responseData;
  }

  async getRestaurantById(id) {
    const cacheKey = `restaurant:${id}`;
    const cached = await readCache(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const restaurant = await repository.findById(id);
    if (!restaurant) {
      throw new RestaurantNotFoundError(id);
    }

    await writeCache(cacheKey, JSON.stringify(restaurant));
    return restaurant;
  }
}
