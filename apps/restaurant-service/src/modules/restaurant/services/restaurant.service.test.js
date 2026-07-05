import { RestaurantService } from './restaurant.service.js';
import { RestaurantRepository } from '../repositories/restaurant.repository.js';
import { jest } from '@jest/globals';

jest.mock('../repositories/restaurant.repository.js');

describe('RestaurantService', () => {
  let service;

  beforeEach(() => {
    service = new RestaurantService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRestaurants', () => {
    it('should call repository.findAll with default pagination', async () => {
      RestaurantRepository.prototype.findAll.mockResolvedValue([]);
      const result = await service.getAllRestaurants({});
      
      expect(RestaurantRepository.prototype.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: ''
      });
      expect(result).toEqual([]);
    });

    it('should pass search parameter to repository', async () => {
      RestaurantRepository.prototype.findAll.mockResolvedValue([]);
      await service.getAllRestaurants({ search: 'pizza' });
      
      expect(RestaurantRepository.prototype.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'pizza'
      });
    });
  });

  describe('getRestaurantById', () => {
    it('should call repository.findById', async () => {
      const mockId = '123-abc';
      RestaurantRepository.prototype.findById.mockResolvedValue({ id: mockId, name: 'Pizza Hut' });
      
      const result = await service.getRestaurantById(mockId);
      
      expect(RestaurantRepository.prototype.findById).toHaveBeenCalledWith(mockId);
      expect(result.name).toBe('Pizza Hut');
    });
  });
});
