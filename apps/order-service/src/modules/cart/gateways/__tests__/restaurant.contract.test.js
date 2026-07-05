import { RestaurantGateway } from '../restaurant.gateway.js';
import axios from 'axios';

jest.mock('axios');

describe('RestaurantGateway - Consumer Contract Test', () => {
  let gateway;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup gateway with mocked axios
    axios.create.mockReturnValue(axios);
    axios.interceptors = { response: { use: jest.fn() } };
    gateway = new RestaurantGateway();
    gateway.client = axios;
  });

  it('should validate the expected response contract from Restaurant Service (MenuItem)', async () => {
    // Expected provider response snapshot (The Contract)
    const mockProviderResponse = {
      data: {
        data: {
          id: 'item-123',
          restaurant_id: 'rest-456',
          price: 15.99,
          price_version: 5, // Important contract field
          is_available: true,
          name: 'Classic Burger',
          menu_version: 10
        }
      }
    };

    axios.get.mockResolvedValue(mockProviderResponse);

    const result = await gateway.getMenuItemDetails('item-123', 'test-trace');

    // Verify mapping to Domain DTO
    expect(result).toBeDefined();
    expect(result.id).toBe('item-123');
    expect(result.restaurantId).toBe('rest-456');
    expect(result.price).toBe(15.99);
    expect(result.priceVersion).toBe(5);
    expect(result.availability).toBe(true);
    expect(result.name).toBe('Classic Burger');
  });
});
