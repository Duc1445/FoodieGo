import MockAdapter from 'axios-mock-adapter';
import { api } from './api';
import { Restaurant } from '../services/restaurant.api';
import { Food } from '../services/food.api';

const mock = new MockAdapter(api, { delayResponse: 500 });

const mockRestaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Sushi Zen',
    description: 'Authentic Japanese sushi and sashimi prepared by master chefs.',
    address: '123 Main St, Tokyo',
    phone: '123-456-7890',
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop',
    is_active: true,
    rating: 4.8,
  },
  {
    id: 'r2',
    name: 'Burger Palace',
    description: 'Gourmet burgers and hand-cut fries in a classic diner setting.',
    address: '456 Elm St, New York',
    phone: '123-456-7891',
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
    is_active: true,
    rating: 4.5,
  },
  {
    id: 'r3',
    name: 'Vegan Bites',
    description: '100% plant-based healthy meals, salads, and smoothies.',
    address: '789 Oak St, LA',
    phone: '123-456-7892',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    is_active: true,
    rating: 4.9,
  },
  {
    id: 'r4',
    name: 'Pizza Paradiso',
    description: 'Wood-fired Neapolitan pizza with fresh ingredients.',
    address: '101 Pine St, Chicago',
    phone: '123-456-7893',
    image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop',
    is_active: true,
    rating: 4.7,
  },
  {
    id: 'r5',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican street tacos, burritos, and fresh guacamole.',
    address: '202 Cedar St, Austin',
    phone: '123-456-7894',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop',
    is_active: true,
    rating: 4.6,
  },
];

const mockFoods: Food[] = [
  {
    id: 'f1',
    name: 'Salmon Nigiri',
    description: 'Fresh Atlantic salmon over seasoned rice. 2 pieces.',
    price: 8.99,
    image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800&auto=format&fit=crop',
    category_id: 'sushi',
    is_available: true,
  },
  {
    id: 'f2',
    name: 'Spicy Tuna Roll',
    description: 'Tuna, spicy mayo, and cucumber rolled in nori and rice.',
    price: 12.50,
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=800&auto=format&fit=crop',
    category_id: 'sushi',
    is_available: true,
  },
  {
    id: 'f3',
    name: 'Double Cheeseburger',
    description: 'Two beef patties, cheddar cheese, lettuce, tomato, and house sauce.',
    price: 14.99,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
    category_id: 'burgers',
    is_available: true,
  },
  {
    id: 'f4',
    name: 'Crispy Fries',
    description: 'Golden, crispy hand-cut potatoes with sea salt.',
    price: 4.99,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=800&auto=format&fit=crop',
    category_id: 'sides',
    is_available: true,
  },
  {
    id: 'f5',
    name: 'Quinoa Bowl',
    description: 'Quinoa, roasted sweet potatoes, avocado, and tahini dressing.',
    price: 11.99,
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    category_id: 'vegan',
    is_available: true,
  },
  {
    id: 'f6',
    name: 'Margherita Pizza',
    description: 'Classic pizza with San Marzano tomato sauce, fresh mozzarella, and basil.',
    price: 16.00,
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop',
    category_id: 'pizza',
    is_available: true,
  },
  {
    id: 'f7',
    name: 'Pepperoni Pizza',
    description: 'Crispy pepperoni over our classic cheese pizza.',
    price: 18.50,
    image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
    category_id: 'pizza',
    is_available: true,
  },
  {
    id: 'f8',
    name: 'Al Pastor Tacos',
    description: 'Marinated pork with pineapple, onions, and cilantro. 3 per order.',
    price: 10.50,
    image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop',
    category_id: 'mexican',
    is_available: true,
  },
  {
    id: 'f9',
    name: 'Chicken Burrito',
    description: 'Grilled chicken, rice, beans, salsa, and cheese wrapped in a flour tortilla.',
    price: 13.00,
    image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop',
    category_id: 'mexican',
    is_available: true,
  },
  {
    id: 'f10',
    name: 'Matcha Latte',
    description: 'Premium ceremonial grade matcha with steamed oat milk.',
    price: 5.50,
    image_url: 'https://images.unsplash.com/photo-1536514072410-5019a3c69182?q=80&w=800&auto=format&fit=crop',
    category_id: 'drinks',
    is_available: true,
  },
];

mock.onGet('/restaurants').reply(200, {
  success: true,
  data: mockRestaurants
});

mock.onGet(/\/restaurants\/r\d+/).reply((config) => {
  const match = config.url?.match(/\/restaurants\/(r\d+)/);
  const id = match ? match[1] : null;
  const restaurant = mockRestaurants.find(r => r.id === id);
  if (restaurant) {
    return [200, { success: true, data: restaurant }];
  }
  return [404, { success: false, message: 'Not found' }];
});

mock.onGet('/foods').reply((config) => {
  let filtered = [...mockFoods];
  if (config.params?.search) {
    const s = config.params.search.toLowerCase();
    filtered = filtered.filter(f => f.name.toLowerCase().includes(s) || f.description.toLowerCase().includes(s));
  }
  return [200, { success: true, data: filtered }];
});

mock.onGet(/\/foods\/f\d+/).reply((config) => {
  const match = config.url?.match(/\/foods\/(f\d+)/);
  const id = match ? match[1] : null;
  const food = mockFoods.find(f => f.id === id);
  if (food) {
    return [200, { success: true, data: food }];
  }
  return [404, { success: false, message: 'Not found' }];
});

export {};
