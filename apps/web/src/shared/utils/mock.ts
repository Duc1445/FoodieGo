import MockAdapter from 'axios-mock-adapter';
import { api } from '../api/api';

const mock = new MockAdapter(api, { delayResponse: 500, onNoMatch: 'passthrough' });

// ==========================================
// MOCK DATA FOR TRULY MISSING FEATURES ONLY
// ==========================================

// Mock Portal Analytics (No Analytics Service Backend)
mock.onGet(/\/portal\/analytics/).reply(200, {
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

export {};
