import MockAdapter from 'axios-mock-adapter';
import { api } from '../api/api';

const mock = new MockAdapter(api, { delayResponse: 500, onNoMatch: 'passthrough' });

// ==========================================
// MOCK DATA FOR MISSING ENDPOINTS ONLY
// (Do NOT mock /restaurants or /menus as they exist in backend)
// ==========================================

// Mock Search API (Missing Search Service)
mock.onGet(/\/search/).reply((_config) => {
  // We'll return an empty array for now since frontend handles search logic manually in this sprint
  // but if the UI decides to call the search API, it won't crash.
  return [200, { success: true, data: { items: [], pagination: { page: 1, limit: 20, total: 0 } } }];
});

// Mock Portal Analytics (No Analytics Backend)
mock.onGet('/portal/analytics').reply(200, {
  success: true,
  data: {
    overview: {
      revenue: 45200,
      revenueChange: 12.5,
      orders: 342,
      ordersChange: 8.2,
      avgOrderValue: 132,
      avgOrderValueChange: -2.4,
      prepTime: 14.5,
      prepTimeChange: -1.2
    },
    revenueTrend: [
      { date: 'Mon', value: 3200 },
      { date: 'Tue', value: 4100 },
      { date: 'Wed', value: 3800 },
      { date: 'Thu', value: 5200 },
      { date: 'Fri', value: 6800 },
      { date: 'Sat', value: 8500 },
      { date: 'Sun', value: 7200 }
    ],
    topFoods: [
      { name: 'Signature Pho', sales: 145 },
      { name: 'Spring Rolls', sales: 120 },
      { name: 'Iced Coffee', sales: 98 },
      { name: 'Banh Mi', sales: 85 }
    ],
    recentOrders: [
      { id: 'ORD-001', customer: 'John D.', status: 'COMPLETED', total: 24.50, time: '10 mins ago' },
      { id: 'ORD-002', customer: 'Sarah M.', status: 'PREPARING', total: 32.00, time: '15 mins ago' },
      { id: 'ORD-003', customer: 'Mike R.', status: 'PENDING', total: 18.75, time: '2 mins ago' }
    ]
  }
});

// Mock Auth Login (Frontend State Only)
mock.onPost('/auth/login').reply((config) => {
  const { email, password, role } = JSON.parse(config.data);
  if (email && password) {
    const userRole = role || 'customer';
    const name = userRole === 'merchant' ? 'Demo Merchant' : userRole === 'admin' ? 'Demo Admin' : 'Demo Customer';
    return [200, { 
      success: true, 
      data: { 
        token: `mock-jwt-token-${userRole}`,
        user: { id: `u-${userRole}`, email, name, role: userRole }
      } 
    }];
  }
  return [401, { success: false, message: 'Invalid credentials' }];
});

export {};
