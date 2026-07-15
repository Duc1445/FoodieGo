import axios from 'axios';
import { InfrastructureError } from '@foodiego/core';

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002';

/**
 * Domain DTO for Menu Item Snapshot
 */
export class MenuItemSnapshot {
  constructor(data) {
    this.id = data.id;
    this.restaurantId = data.restaurant_id;
    this.price = data.price;
    this.priceVersion = data.price_version || 1; // Assuming restaurant service sends this
    this.availability = data.status === 'AVAILABLE';
    this.name = data.name;
    this.menuVersion = data.menu_version || 1; // Restaurant menu overall version
  }
}

export class RestaurantGateway {
  constructor() {
    this.client = axios.create({
      baseURL: RESTAURANT_SERVICE_URL,
      timeout: 5000, // 5 seconds timeout
    });

    // Advanced retry interceptor
    this.client.interceptors.response.use(undefined, async (err) => {
      const config = err.config;
      if (!config || !config.retry) return Promise.reject(err);

      // Only retry on specific status codes (Rate Limiting or Server Errors)
      const status = err.response ? err.response.status : null;
      const shouldRetry = !status || [429, 502, 503, 504].includes(status);

      if (!shouldRetry) {
        return Promise.reject(err);
      }

      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount >= config.retry) {
        return Promise.reject(err);
      }

      config.__retryCount += 1;

      // Exponential Backoff with Jitter
      const backoff = Math.pow(2, config.__retryCount) * 1000;
      const jitter = Math.random() * 500;
      const delay = backoff + jitter;

      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.client(config);
    });
  }

  /**
   * Fetches menu item details mapped to a Domain DTO.
   */
  async getMenuItemDetails(menuItemId, traceId) {
    try {
      const response = await this.client.get(`/api/v1/menus/items/${menuItemId}`, {
        headers: { 'x-trace-id': traceId },
        retry: 2, // Retry up to 2 times on failure
      });
      return new MenuItemSnapshot(response.data.data);
    } catch (err) {
      if (err.response && err.response.status === 404) return null;
      throw new InfrastructureError(
        `Failed to fetch from Restaurant Service: ${err.message}`,
        'RESTAURANT_GATEWAY_ERROR',
      );
    }
  }

  /**
   * Fetches all menu items for a restaurant mapped to DTOs.
   */
  async getRestaurantMenu(restaurantId, traceId) {
    try {
      const response = await this.client.get(`/api/v1/restaurants/${restaurantId}/menu`, {
        headers: { 'x-trace-id': traceId },
        retry: 2,
      });
      const categories = response.data.data;
      let allItems = [];
      categories.forEach((cat) => {
        if (cat.items) {
          cat.items.forEach((item) => {
            item.price_version = item.price_version || 1;
            item.menu_version = response.data.menu_version || 1;
            allItems.push(new MenuItemSnapshot(item));
          });
        }
      });
      return allItems;
    } catch (err) {
      throw new InfrastructureError(
        `Failed to fetch menu from Restaurant Service: ${err.message}`,
        'RESTAURANT_GATEWAY_ERROR',
      );
    }
  }

  async getRestaurantById(restaurantId, traceId) {
    try {
      const response = await this.client.get(`/api/v1/restaurants/${restaurantId}`, {
        headers: { 'x-trace-id': traceId },
        retry: 2,
      });
      return response.data.data;
    } catch (err) {
      if (err.response && err.response.status === 404) return null;
      throw new InfrastructureError(
        `Failed to fetch restaurant from Restaurant Service: ${err.message}`,
        'RESTAURANT_GATEWAY_ERROR',
      );
    }
  }
}
